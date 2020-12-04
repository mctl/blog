### zabbix安装及部署

> 写在前面，本教程用的zabbix4.2版本，php默认安装的是5.6，整套安装下来系统漏洞较多，如果有安全性要求需要额外处理，最好安装新版本

#### 1、下载rpm包

在官网<code>http://repo.zabbix.com/zabbix/4.2/rhel/7/x86_64/</code>选择版本，把所有包下一遍，主要包括

```shell
zabbix-agent
zabbix-get
zabbix-sender
zabbix-web
zabbix-server-mysql
zabbix-web-mysql
```
按照具体需求下载需要的rpm包，有yum源的情况下会自动处理依赖，把php、httpd等都安装好

如果是完全离线环境需要准备所有依赖包，可以安装的时候缺什么下载什么

#### 2、安装zabbix
把rpm包上传到服务器，可用rzsz命令

在rpm包目录下执行安装命令，以4.2版本为例

```shell
yum install -y zabbix-agent-4.2.0-1.el7.x86_64.rpm zabbix-get-4.2.0-1.el7.x86_64.rpm zabbix-sender-4.2.0-1.el7.x86_64.rpm zabbix-server-mysql-4.2.0-1.el7.x86_64.rpm zabbix-web-4.2.0-1.el7.noarch.rpm zabbix-web-mysql-4.2.0-1.el7.noarch.rpm 
```

> 在149测试环境下yum源提供了所有依赖，于是一切顺利的安装好了...

> 如果提示缺乏依赖就需要自己提前准备rpm包了

### 3、安装mysql

此处不再赘述，装好mysql即可

#### 3.1、创建用户
安装好后，创建zabbix用户及密码zabbix
> zabbix配置文件中mysql的密码默认为zabbix，如果改了密码，需要改配置文件


```shell
GRANT ALL PRIVILEGES ON *.* TO 'zabbix'@'%' IDENTIFIED BY 'zabbix' WITH GRANT OPTION;

FLUSH PRIVILEGES;
```

#### 3.2、创建数据库

创建名为zabbix的数据库

```shell
create database zabbix character set utf8 collate utf8_bin;
```

#### 3.3、执行zabbix的初始化脚本

执行脚本位置：

```shell
/usr/share/doc/zabbix-server-mysql-4.2.0/create.sql.gz
```

找到执行脚本并解压：

```shell
gunzip create.sql.gz
```

解压后执行

```shell
cat /usr/share/doc/zabbix-server-mysql-4.2.0/create.sql | mysql zabbix -uzabbix -p
```

### 4、启动服务

```shell
systemctl restart zabbix-server

systemctl restart zabbix-agent

systemctl restart httpd
```

启动成功后可以在浏览器访问：<code>http://ip:80/zabbix</code>

如果有检测项未通过请看5，如果一切正常点击下一步即可

Configure DB connection步骤补充数据库信息；

如果提示mysql.sock报错，可以将localhost改为127.0.0.1，或者通过mysql配置解决sock问题

登录zabbix：默认用户名/密码：Admin/zabbix

进去之后可以修改语言为简体中文，同时zabbix默认监控的本机，以此可检测zabbix是否安装部署成功

#### 判断是否安装

ss命令查看监听端口
```shell
ss -unlt
```
- 80:httpd默认端口
- 10051:zabbix-server默认端口
- 10050:zabbix-agent默认端口
- 3306:mysql默认端口


### 5、根据zabbix页面的自检解决出现的问题

因为前面没有进行任何配置，所以几乎肯定有检测项未通过：

#### 5.1、PHP option "date.timezone"项问题解决：

修改php配置：
```shell
vi /etc/php.ini
```
找到date.timezone配置项，放开注释，并改为：

```shell
date.timezone = Asia/Shanghai
```

#### 5.2、zabbix-server启动失败，日志中mysql.sock报错，无法连接

根据报错信息：

```shell
 connection to database 'zabbix' failed: [2002] Can't connect to local MySQL server through socket '/var/lib/mysql/mysql.sock'
```

把mysql安装目录的mysql.sock（位置是mysql配置文件中指定的）软连接到报错的目录，如果该目录已经有mysql.sock，删掉继续软连接
```shell
ln -s /usr/local/mysql-5.7.26-linux-glibc2.12-x86_64/mysql.sock /var/lib/mysql/mysql.sock
```
#### 5.3、用户权限问题
本次安装都是用root用户，如果涉及权限问题，请设置权限组和权限，自行搜索解决...

#### 5.4、页面无法访问

- 可能情况一: 服务启动报错，主要解决报错
- 可能情况二: httpd服务没有指向zabbix的页面

可能二主要出现在单独安装httpd的过程中，如果是安装zabbix时作为依赖安装的应该没有问题

此时可以查看httpd服务的页面地址，如果不是指向zabbix页面可以复制一份到80端口访问的目录

各种配置文件位置拉到最后查看...

#### 5.5、其他问题

本次安装比较顺利，并未出现其他问题...

如其他项检测未通过多半是因为缺少依赖，解决依赖即可

```shell
zabbix页面位置：/usr/share/zabbix
zabbix日志：var/log/zabbix
httpd日志：var/log/httpd
zabbix配置文件：etc/zabbix
httpd配置文件：etc/httpd/conf/httpd.conf
php配置文件：etc/php.ini

syslog配置文件：/etc/rsyslog.conf
syslog启动命令位置：/etc/sysconfig/rsyslog
```


```shell
查看日志命令：
tail -n 50 zabbix_server.log
清空日志命令：
truncate --size 0 zabbix_server.log
权限命令：
groupadd apache
useradd -g apache apache
设置文件权限命令：
chmod -R 777 /var/lib/php/session
chown zabbix.zabbix /var/log/zabbix/zabbix_server.log

```

