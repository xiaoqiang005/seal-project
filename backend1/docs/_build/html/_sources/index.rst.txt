后端API文档
==========

欢迎使用后端API文档！

.. toctree::
   :maxdepth: 2
   :caption: 目录:

   api
   models
   views

API 文档
-------

API文档可以通过以下方式访问：

* Swagger UI: http://localhost:8000/swagger/
* ReDoc: http://localhost:8000/redoc/

项目结构
-------

.. code-block:: text

   backend1/
   ├── apps/          # Django应用目录
   ├── config/        # 项目配置
   ├── docs/          # 文档
   ├── requirements/  # 依赖管理
   └── manage.py      # Django管理脚本

开发指南
-------

1. 安装依赖::

    pip install -r requirements/development.txt

2. 运行开发服务器::

    python manage.py runserver

3. 访问文档::

    # Swagger文档
    http://localhost:8000/swagger/
    
    # ReDoc文档
    http://localhost:8000/redoc/
    
    # Sphinx文档（构建后）
    cd docs && make html 