### 1、syslog安装

大部分linux预先安装了syslog服务，直接配置启动就完事了

本篇主要目的是通过配置syslog，可以接收到远程机器发来的日志，然后用zabbix监控日志文件，从而达到远程监控的目的

### 2、配置

#### 2.1、修改启动命令

```shell
修改启动命令：
vi /etc/sysconfig/rsyslog

增加配置：
SYSLOGD_OPTIONS="-r -x -m 0"

-r: 打开接受外来日志消息的功能，其监控514 UDP端口；

-x: 关闭自动解析对方日志服务器的FQDN信息，这能避免DNS不完整所带来的麻烦；
```
修改为接收外来日志，会把接收日志追加到<code>/var/log/messages</code>


#### 2.2、修改配置文件
放开这几行注释，开始监听514端口，主要是upd的514端口

```shell
vi /etc/rsyslog.conf

# Provides UDP syslog reception
$ModLoad imudp
$UDPServerRun 514

# Provides TCP syslog reception
$ModLoad imtcp
$InputTCPServerRun 514

```

```shell
syslog配置文件：/etc/rsyslog.conf
启动命令位置：/etc/sysconfig/rsyslog
```

