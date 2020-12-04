#### 前言

#### curl

#### 用户认证
```shell
增加配置：--user username:password

//例：查询所有索引
curl -XGET --user aspirecn:1qaz2wsx http://10.221.207.70:9200/_cat/indices\?v

//可能报错，没有操作权限
type=security_exception,
reson=action [indices:admin/create] is unauthorized for user[username]]

```
#### 写入数据

```shell
curl -XPOST -H "Content-Type: application/json" http://10.1.3.87:9200/evil_20200415/log -d '{"msisdn":"12388277","imei":"66666"}'
```
evil_20200415为索引，log为类型，类型后面还可以加id，不加id默认


#### 创建索引
直接写入文档也可以创建索引，两种方式所需权限不同

```shell
curl -XPUT --user aspirecn:1qaz2wsx 'http://192.168.80.200:9200/test_index'
```


#### 查询所有索引

```shell
curl -XGET http://10.1.3.87:9200/_cat/indices\?v
```

#### 删除索引

```shell
curl -XDELETE —user aspirecn:1qaz2wsx http://10.221.207.70:9200/evil_2020060
```
#### 给索引增加别名

```shell
curl -XPOST -H "Content-Type: application/json" http://10.1.3.87:9200/_aliases -d 
 '{
    "actions": [
        {
            "add": {
                "index": "evil_20200509",
                "alias": "evil"
            }
        }
    ]
}'
```

#### 查询索引全部数据

```shell
curl -XGET http://10.1.3.87:9200/evil_20200415/_search?pretty
```
pretty美化结果

#### 查询索引mapping

```shell
curl -XGET http://10.1.3.87:9200/evil_20200415/_mapping?pretty
```


#### 条件查询

- size：查几条
- from：从哪开始查
- _source：显示的字段（其他的将不显示）
- query：匹配度如何，模糊搜索
- query-match：全文检索
- query-match_phrase：精确匹配
- query-multi_match：查询多个字段
- query-range：查询范围
    - gt: > 大于
    - lt: < 小于
    - gte: >= 大于等于
    - lte: <= 小于等于


```shell
{
    "query": {
        "match" : {
            "message" : "hello world"
        }
    }
}
```

```shell
{
    "query": {
        "range" : {
            "age" : {
                "gte" : 10,
                "lte" : 20,
                "boost" : 2.0 //权重
            }
        }
    }
}

```



```shell
curl -XGET -H "Content-Type: application/json" http://10.1.3.87:9200/evil_20200415/_search?pretty -d '
{
    "size":2,
    "from":0,
    "_source": ["msisdn", "imei"]
}'
```
#### 查询结果排序
排序不支持mapping类型为text，会报错，无法查出结果，如果是long类型需在写入的时候转换

```shell
"sort": [
    {
        "procedureStartTime": {
            "order": "desc",
            "unmapped_type": "long"
        }
    }
]
```

#### 报错

##### 1、分页查询报错

```shell
from + size must be less than or equal to: [10000] but was [1615270]
```
es默认深分页查询结果最多为1万，解决有两个办法
<br><br>
1、了解滚动查询（游标的方式）

```shell
https://www.elastic.co/guide/en/elasticsearch/client/java-rest/current/java-rest-high-search-scroll.html
```

2、设置一个更大的max_result_window值

```shell
curl -XPUT -H "Content-Type: application/json" --user aspirecn:1qaz2wsx http://10.221.207.70:9200/evil/_settings -d '{ "index" : { "max_result_window" : 50000}}'
```


