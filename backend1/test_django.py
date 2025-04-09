import django
print(f"Django version: {django.get_version()}")

try:
    from django.core.management import execute_from_command_line
    print("Successfully imported django.core.management")
except ImportError as e:
    print(f"Error importing django.core.management: {e}") 