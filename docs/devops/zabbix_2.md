### 1、snmp简介

### 2、安装snmp

先yum list判断yum源有没有snmp

```shell
yum list | grep snmp
```

发现列出来很多snmp相关，如果没有可以更换yum源或者离线下载rpm包上传服务器安装

#### 2.1、yum安装:

```shell
yum install net-snmp net-snmp-utils
```
#### 2.2、启动

```shell
systemctl restart snmpd
```
查看监听端口：snmp监听161端口

```shell
ss -unlt
```
用snmp命令测试：

```shell
查看主机名：
snmpwalk -v 2c -c public localhost sysName.0

获取cpu空闲率：
snmpwalk -v 2c -c public localhost 1.3.6.1.4.1.2021.11.11.0
```
此时应该无法获取到cpu信息，需要配置权限

### 3、修改配置文件

#### 3.1、修改查看设备节点权限
```shell
vi /etc/snmp/snmpd.conf
```

在
```shell
view    systemview    included   .1.3.6.1.2.1.1
view    systemview    included   .1.3.6.1.2.1.25.1.1
```
位置前加一行，表示可以查看.1下所有信息，修改为以下：
```shell
view    systemview    included   .1
view    systemview    included   .1.3.6.1.2.1.1
view    systemview    included   .1.3.6.1.2.1.25.1.1
```
#### 3.2、修改Process checks的配置

将

```shell
# proc mountd

# proc ntalkd 4

# proc sendmail 10 1
```
中的注释去掉，修改为以下：
```shell
proc mountd

proc ntalkd 4

proc sendmail 10 1
```
#### 3.3、修改Executables/scripts配置

```shell
#exec echotest /bin/echo hello world
```
去掉注释
#### 3.4、修改disk checks配置

```shell
#disk / 10000
```
去掉注释

#### 3.4、修改load average checks配置
```shell
#load 12 14 14
```
去掉注释

### 4、重启服务

```shell
systemctl restart snmpd
```
测试：
```shell
获取cpu空闲占比：
snmpget -v 2c -c public localhost .1.3.6.1.4.1.2021.11.11.0
UCD-SNMP-MIB::ssCpuIdle.0 = INTEGER: 95

获取内存及磁盘：
snmpget -v 2c -c public localhost .1.3.6.1.2.1.25.2.2.0
HOST-RESOURCES-MIB::hrMemorySize.0 = INTEGER: 16268156 KBytes

参考博客：
https://blog.csdn.net/zhaomax/article/details/81085764

oid列表：
http://www.ttlsa.com/monitor/snmp-oid/
```
### 5、在zabbix中用snmp接口监控

创建主机，主机名为机器名，选择snmp接口，填写ip，端口默认161

接下来可以选择模板和创建监控项...主要都是页面配置

