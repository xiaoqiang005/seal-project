from django.db import models
from django.core.exceptions import ValidationError

class Organization(models.Model):
    """区域管理模型"""
    LEVEL_CHOICES = [
        ('省级', '省级'),
        ('市级', '市级'),
        ('区级', '区级'),
        ('县级', '县级'),
    ]

    LEVEL_ORDER = {
        '省级': 1,
        '市级': 2,
        '区级': 3,
        '县级': 4
    }

    name = models.CharField(max_length=255, verbose_name='区域名称')
    code = models.CharField(max_length=50, unique=True, verbose_name='编码')
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='children', verbose_name='父级区域')
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES, verbose_name='层级')
    status = models.BooleanField(default=True, verbose_name='状态')
    sort_order = models.IntegerField(default=0, verbose_name='排序')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = '区域'
        verbose_name_plural = '区域管理'
        ordering = ['level', 'code']  # 首先按层级排序，然后按编码排序
        unique_together = [['parent', 'name']]

    def __str__(self):
        return self.name

    def clean(self):
        """数据验证"""
        if self.parent:
            # 检查父级层级是否合法
            parent_level_order = self.LEVEL_ORDER.get(self.parent.level, 0)
            current_level_order = self.LEVEL_ORDER.get(self.level, 0)
            
            # 严格检查层级关系
            if self.parent.level == '省级' and self.level not in ['市级', '区级', '县级']:
                raise ValidationError({'level': '省级下只能添加市级、区级或县级'})
            elif self.parent.level == '市级' and self.level not in ['区级', '县级']:
                raise ValidationError({'level': '市级下只能添加区级或县级'})
            elif self.parent.level in ['区级', '县级']:
                raise ValidationError({'level': f'{self.parent.level}不能添加下级区域'})
            
            # 检查是否形成循环引用
            if self.would_create_cycle():
                raise ValidationError({'parent': '不能选择自己或其子区域作为父级'})
        # 移除顶级区域必须是省级的限制
        # else:
        #     if self.level != '省级':
        #         raise ValidationError({'level': '顶级区域必须是省级'})

    def save(self, *args, **kwargs):
        """保存前进行验证和设置排序值"""
        self.clean()
        if not self.sort_order:
            self.sort_order = self.LEVEL_ORDER.get(self.level, 5)
        super().save(*args, **kwargs)

    def would_create_cycle(self):
        """检查是否会形成循环引用"""
        if not self.parent:
            return False
        
        current = self.parent
        while current is not None:
            if current.id == self.id:
                return True
            current = current.parent
        return False

    def get_full_path(self):
        """获取完整的区域路径"""
        path = [self.name]
        current = self.parent
        while current is not None:
            path.append(current.name)
            current = current.parent
        return ' / '.join(reversed(path))

    def get_all_children(self, include_self=True):
        """获取所有子区域（包括自己）"""
        result = []
        if include_self:
            result.append(self)
        
        for child in self.children.all():
            result.extend(child.get_all_children(include_self=True))
        return result

    def get_available_levels(self):
        """获取可用的下级层级"""
        current_order = self.LEVEL_ORDER.get(self.level, 0)
        available_levels = []
        
        for level, order in self.LEVEL_ORDER.items():
            if order > current_order:
                available_levels.append(level)
        
        return available_levels