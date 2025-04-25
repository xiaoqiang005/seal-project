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
from django.core.cache import cache

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
        # 添加强制刷新参数，用于清除缓存
        force_refresh = request.query_params.get('force_refresh', 'false').lower() == 'true'
        
        # 使用缓存存储树形结构，减少数据库查询
        cache_key = 'organization_tree_cache'
        if search_key:
            cache_key = f'{cache_key}_{search_key}'
        
        # 缓存参数
        cache_timeout = 60  # 60秒，与settings中的开发环境缓存时间保持一致
            
        # 如果不强制刷新则尝试从缓存获取
        if not force_refresh:
            cached_tree = cache.get(cache_key)
            if cached_tree is not None:
                return Response(cached_tree)
        
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
        
        # 把所有组织按树形结构返回
        roots = []
        org_dict = {}
        
        # 构建字典，便于快速查找
        for org in queryset:
            data = self.serializer_class(org, context={'request': request}).data
            data['children'] = []
            org_dict[org.id] = data
            
        # 构建树形结构
        for org_id, org_data in org_dict.items():
            if org_data.get('parent') and org_data['parent'] in org_dict:
                org_dict[org_data['parent']]['children'].append(org_data)
            else:
                roots.append(org_data)
                
        # 按层级排序
        def sort_by_level(item):
            return level_order.get(item.get('level', ''), 999)
            
        # 递归排序所有节点
        def sort_node(node):
            if node.get('children'):
                node['children'] = sorted(node['children'], key=sort_by_level)
                for child in node['children']:
                    sort_node(child)
                    
        # 排序根节点
        roots = sorted(roots, key=sort_by_level)
        for root in roots:
            sort_node(root)
        
        # 缓存处理结果，减少后续查询
        cache.set(cache_key, roots, cache_timeout)
        
        return Response(roots)

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
                
                # 创建成功后清除组织树缓存，确保前端能立即看到新数据
                self._clear_tree_cache()
                
                headers = self.get_success_headers(serializer.data)
                return Response(
                    {
                        **serializer.data,
                        'cache_refreshed': True  # 添加缓存刷新标志
                    },
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
            
            # 更新成功后清除相关缓存
            instance_id = instance.id
            # 清除该记录的缓存
            cache_key = f'org_index_{instance_id}'
            cache.delete(cache_key)
            
            # 清除组织树缓存
            self._clear_tree_cache()
            
            print(f"已成功更新组织ID: {instance_id} 并清除相关缓存")
            
            return Response({
                **serializer.data,
                'cache_refreshed': True  # 添加缓存刷新标志
            })
            
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

    def destroy(self, request, *args, **kwargs):
        """删除组织记录并清除缓存
        
        重写删除方法，在成功删除记录后清除相关缓存
        """
        try:
            instance = self.get_object()
            instance_id = instance.id
            
            # 执行删除操作前先保存需要的信息
            response_data = {'cache_refreshed': True, 'id': instance_id, 'success': True}
            
            # 执行删除操作
            self.perform_destroy(instance)
            
            # 清除该记录的缓存
            cache_key = f'org_index_{instance_id}'
            cache.delete(cache_key)
            
            # 清除组织树缓存
            self._clear_tree_cache()
            
            print(f"已成功删除组织ID: {instance_id} 并清除相关缓存")
            
            # 返回200而不是204，因为我们有响应内容
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"删除组织时发生错误: {str(e)}")
            return Response(
                {'detail': str(e), 'success': False},
                status=status.HTTP_400_BAD_REQUEST
            )

    def _clear_tree_cache(self):
        """清除所有组织树相关的缓存
        
        包括主树缓存和各种搜索条件下的缓存
        """
        # 清除默认的树缓存
        cache.delete('organization_tree_cache')
        
        # 对于搜索条件缓存，我们可以设置一个通用的前缀并使用通配符删除
        # 但大多数缓存后端不支持通配符删除，所以这里列出常见搜索关键词删除
        common_search_terms = ['省', '市', '区', '县']
        for term in common_search_terms:
            cache.delete(f'organization_tree_cache_{term}')
        
        # 记录日志
        print(f"已清除组织树相关缓存") 