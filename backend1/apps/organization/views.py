from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view
from django.db import transaction
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from .models import Organization
from .serializers import OrganizationSerializer
from .permissions import OrganizationPermission
from .filters import OrganizationFilter

class OrganizationViewSet(viewsets.ModelViewSet):
    """区域管理视图集
    
    提供区域的增删改查、树形结构获取等功能。
    包含以下主要功能：
    - 创建区域（支持顶级和子级）
    - 更新区域信息
    - 获取区域树形结构
    - 获取可用的下级层级
    """
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [OrganizationPermission]
    filter_backends = [DjangoFilterBackend]
    filterset_class = OrganizationFilter

    # 层级映射：数字到文本
    LEVEL_MAPPING = {
        1: '省级',
        2: '市级',
        3: '区级',
        4: '县级'
    }

    # 层级映射：文本到数字
    LEVEL_NUMBER = {
        '省级': 1,
        '市级': 2,
        '区级': 3,
        '县级': 4
    }

    def _check_level_depth(self, parent):
        """检查层级深度
        
        Args:
            parent: 父级组织对象
            
        Returns:
            bool: 是否超过最大深度限制
        """
        if not parent:
            return True
            
        depth = 1
        current = parent
        while current.parent:
            depth += 1
            current = current.parent
            
        return depth < 4  # 最多允许4层深度

    def _check_sibling_name_unique(self, name, parent, exclude_id=None):
        """检查同级区域名称是否唯一
        
        Args:
            name: 区域名称
            parent: 父级组织对象
            exclude_id: 排除的组织ID（用于更新时）
            
        Returns:
            bool: 名称是否唯一
        """
        query = Organization.objects.filter(name=name, parent=parent)
        if exclude_id:
            query = query.exclude(id=exclude_id)
        return not query.exists()

    @action(detail=False, methods=['get'])
    def tree(self, request):
        """获取组织机构树形结构"""
        search_key = request.query_params.get('search', '')
        
        # 定义层级顺序
        level_order = {
            '省级': 1,
            '市级': 2,
            '区级': 3,
            '县级': 4
        }
        
        # 基础查询集
        queryset = self.get_queryset()
        
        # 如果有搜索关键字，先查找匹配的节点
        if search_key:
            queryset = queryset.filter(
                Q(name__icontains=search_key) |
                Q(code__icontains=search_key)
            ).distinct()
            
            # 获取匹配节点的所有父节点ID
            parent_ids = set()
            for org in queryset:
                current = org
                while current.parent_id:
                    parent_ids.add(current.parent_id)
                    current = current.parent
            
            # 合并搜索结果和父节点
            if parent_ids:
                queryset = self.get_queryset().filter(
                    Q(id__in=queryset.values_list('id', flat=True)) |
                    Q(id__in=parent_ids)
                )
        
        # 优化查询，减少数据库访问
        queryset = queryset.select_related('parent')
        
        def build_tree(parent=None):
            # 获取当前层级的节点
            nodes = [node for node in queryset if node.parent_id == (parent.id if parent else None)]
            # 按行政级别和编码排序
            nodes.sort(key=lambda x: (level_order.get(x.level, 5), x.code))
            
            result = []
            for node in nodes:
                node_data = self.get_serializer(node).data
                children = build_tree(node)
                if children:
                    node_data['children'] = children
                result.append(node_data)
            return result
        
        # 构建树形结构
        tree_data = build_tree(None)
        return Response(tree_data)

    def create(self, request, *args, **kwargs):
        """创建区域
        
        支持创建顶级区域和子区域，包含以下验证：
        - 必填字段验证
        - 编码格式验证（6位数字）
        - 父级存在性验证
        - 层级关系验证
        - 编码唯一性验证
        - 层级深度验证
        - 同级名称唯一性验证
        """
        try:
            # 添加请求日志
            print('收到创建请求:', {
                'data': request.data,
                'method': request.method,
                'content_type': request.content_type
            })
            
            with transaction.atomic():
                # 验证必填字段
                required_fields = ['name', 'level']
                for field in required_fields:
                    if not request.data.get(field):
                        print(f'缺少必填字段: {field}')
                        return Response(
                            {'detail': f'请输入{field}'},
                            status=status.HTTP_400_BAD_REQUEST
                        )

                # 获取父级信息
                parent_id = request.data.get('parent')
                parent = None
                if parent_id:
                    parent = Organization.objects.filter(id=parent_id).first()
                    if not parent:
                        print(f'父级组织不存在: {parent_id}')
                        return Response(
                            {'detail': '父级组织不存在'},
                            status=status.HTTP_400_BAD_REQUEST
                        )

                # 验证层级关系
                level = request.data.get('level')
                if parent:
                    print(f'验证层级关系: 父级={parent.level}, 当前={level}')
                    if parent.level == '省级':
                        if level not in ['市级', '区级', '县级']:
                            return Response(
                                {'detail': '省级下只能添加市级、区级或县级'},
                                status=status.HTTP_400_BAD_REQUEST
                            )
                    elif parent.level == '市级':
                        if level not in ['区级', '县级']:
                            return Response(
                                {'detail': '市级下只能添加区级或县级'},
                                status=status.HTTP_400_BAD_REQUEST
                            )
                    elif parent.level in ['区级', '县级']:
                        return Response(
                            {'detail': f'{parent.level}不能添加下级'},
                            status=status.HTTP_400_BAD_REQUEST
                        )

                # 验证编码
                code = request.data.get('code', '')
                if not parent:  # 顶级区域需要验证编码
                    print(f'验证顶级区域编码: {code}')
                    if not code or not code.isdigit() or len(code) != 6:
                        return Response(
                            {'detail': '编码必须是6位纯数字'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    if Organization.objects.filter(code=code).exists():
                        return Response(
                            {'detail': '该编码已存在'},
                            status=status.HTTP_400_BAD_REQUEST
                        )

                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                self.perform_create(serializer)
                headers = self.get_success_headers(serializer.data)
                return Response(
                    serializer.data,
                    status=status.HTTP_201_CREATED,
                    headers=headers
                )
        except Exception as e:
            print(f'创建区域时发生错误: {str(e)}')
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def update(self, request, *args, **kwargs):
        """更新区域信息
        
        允许更新名称和层级，但需遵循层级规则
        
        Args:
            request: 请求对象
            
        Returns:
            Response: 更新结果
        """
        try:
            instance = self.get_object()
            
            # 验证必填字段
            if not request.data.get('name'):
                return Response(
                    {'detail': '请输入区域名称'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # 检查同级名称是否重复
            if not self._check_sibling_name_unique(
                request.data['name'], 
                instance.parent,
                exclude_id=instance.id
            ):
                return Response(
                    {'detail': '同级区域名称不能重复'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # 如果要修改层级
            if 'level' in request.data and request.data['level'] != instance.level:
                # 检查是否有子节点
                if instance.children.exists():
                    return Response(
                        {'detail': '该区域存在子节点，不能修改层级'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # 检查新层级是否符合父级层级规则
                if instance.parent:
                    parent = instance.parent
                    new_level = request.data['level']
                    if parent.level == '省级' and new_level not in ['市级', '区级', '县级']:
                        return Response(
                            {'detail': '省级下只能是市级、区级或县级'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    elif parent.level == '市级' and new_level not in ['区级', '县级']:
                        return Response(
                            {'detail': '市级下只能是区级或县级'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    elif parent.level == '区级' and new_level != '县级':
                        return Response(
                            {'detail': '区级下只能是县级'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    elif parent.level == '县级':
                        return Response(
                            {'detail': '县级不能添加下级区域'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
            
            # 使用序列化器更新数据
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def available_levels(self, request, pk=None):
        """获取可用的下级层级
        
        根据当前区域的层级，返回可添加的下级层级列表
        
        Args:
            request: HTTP请求
            pk: 区域ID
            
        Returns:
            Response: 可用层级列表
        """
        try:
            instance = self.get_object()
            available = []
            
            if instance.level == '省级':
                available = ['市级', '区级', '县级']
            elif instance.level == '市级':
                available = ['区级', '县级']
                
            return Response({'available_levels': available})
            
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            ) 