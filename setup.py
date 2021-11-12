from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in attendance_plus/__init__.py
from attendance_plus import __version__ as version

setup(
	name="attendance_plus",
	version=version,
	description=".",
	author="Bantoo",
	author_email="devs@thebantoo.com",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
