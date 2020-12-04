#### 前言
略
#### 1、引入mvn
- 如果已经有netty不需要重新引入
- 报错考虑jar冲突
- 已有的jackson报错：如果其他地方不用可以直接删除，或者解析jar冲突问题

```xml
<dependency>
	<groupId>org.elasticsearch</groupId>
	<artifactId>elasticsearch</artifactId>
	<version>6.8.0</version>
</dependency>
<dependency>
	<groupId>org.elasticsearch.client</groupId>
	<artifactId>transport</artifactId>
	<version>6.8.0</version>
</dependency>
<dependency>
	<groupId>io.netty</groupId>
	<artifactId>netty-all</artifactId>
	<version>4.1.25.Final</version>
</dependency>
```
#### 2、使用

```java
/**
 * 日志查询，从es接口查
 * 分页查询报错：from + size must be less than or equal to: [10000] but was [1615270]
 * 解决：es默认分页查询最大为1万，可设置一个更大的max_result_window值
 * 设置命令：curl -XPUT -H "Content-Type: application/json" --user username:password http://es-ip:9200/index/_settings -d '{ "index" : { "max_result_window" : 50000}}'
 *
 * @param model
 * @param fishHostLogVo
 * @return
 */
@RequestMapping(value = "/list")
public String list(Model model, FishHostLogVo fishHostLogVo){
    logger.info("请求页面：fishHostLog/list");
    FishHostLogVo sv = (fishHostLogVo != null) ? fishHostLogVo : new FishHostLogVo();

    //1. 构建基础认证信息
    CredentialsProvider credentialsProvider = new BasicCredentialsProvider();
    credentialsProvider.setCredentials(AuthScope.ANY, new UsernamePasswordCredentials(USERNAME, PASSWORD));

    //2. 创建RestHighLevelClient
    try (RestHighLevelClient client = new RestHighLevelClient(
            RestClient.builder(
                    new HttpHost(ES_IP, Integer.parseInt(ES_PORT), "http"))
                    .setHttpClientConfigCallback(httpAsyncClientBuilder -> {
                        //这里可以设置一些参数，比如cookie存储、代理等等
                        httpAsyncClientBuilder.disableAuthCaching();
                        return httpAsyncClientBuilder.setDefaultCredentialsProvider(credentialsProvider);
                    })
    )) {

        //查询条件
        BoolQueryBuilder boolQueryBuilder = QueryBuilders.boolQuery();

        //入库时间
        RangeQueryBuilder procedureStartTime = null;
        if (StringUtils.isNotBlank(fishHostLogVo.getCreateTimeStart())) {
            //范围查询
            long startDate = FastDateFormat.getInstance("yyyy-MM-dd HH:mm:ss")
                    .parse(fishHostLogVo.getCreateTimeStart()).getTime();
            procedureStartTime = QueryBuilders.rangeQuery("procedureStartTime")
                    .gte(startDate);

            if (StringUtils.isNotBlank(fishHostLogVo.getCreateTimeEnd())) {
                long endDate = FastDateFormat.getInstance("yyyy-MM-dd HH:mm:ss")
                        .parse(fishHostLogVo.getCreateTimeEnd()).getTime();
                procedureStartTime.lte(endDate);
            }
        } else {

            //最多查询一个月数据
            Calendar cal = Calendar.getInstance();
            cal.setTime(new Date() );
            cal.add(Calendar.MONTH, -1);
            Date lastMonth = cal.getTime();
            procedureStartTime = QueryBuilders.rangeQuery("procedureStartTime")
                    .gte(lastMonth.getTime());
            sv.setCreateTimeStart(FastDateFormat.getInstance("yyyy-MM-dd HH:mm:ss").format(lastMonth));

            if (StringUtils.isNotBlank(fishHostLogVo.getCreateTimeEnd())) {
                long endDate = FastDateFormat.getInstance("yyyy-MM-dd HH:mm:ss")
                        .parse(fishHostLogVo.getCreateTimeEnd()).getTime();

                procedureStartTime = QueryBuilders.rangeQuery("procedureStartTime")
                        .lte(endDate);
            }
        }

        //恶意类型
        MatchPhraseQueryBuilder evilType = null;
        if (StringUtils.isNotBlank(fishHostLogVo.getEvilType())) {
            //精确搜索
            evilType = QueryBuilders.matchPhraseQuery("evilType", fishHostLogVo.getEvilType());
            boolQueryBuilder.must(evilType);
        }

        //二级域名
        WildcardQueryBuilder secondHost = null;
        if (StringUtils.isNotBlank(fishHostLogVo.getSecondHost())) {
            //模糊搜索
            secondHost = QueryBuilders.wildcardQuery("secondHost", "*" + fishHostLogVo.getSecondHost() + "*");
            boolQueryBuilder.must(secondHost);
        }

        //手机号码
        WildcardQueryBuilder msisdn = null;
        if (StringUtils.isNotBlank(fishHostLogVo.getMsisdn())) {
            msisdn = QueryBuilders.wildcardQuery("msisdn", "*" + fishHostLogVo.getMsisdn() + "*");
            boolQueryBuilder.must(msisdn);
        }
        if (null != procedureStartTime) {
            boolQueryBuilder.must(procedureStartTime);
        }

        if (null == fishHostLogVo.getPageNum()) {
            fishHostLogVo.setPageNum(1);
        }
        if (null == fishHostLogVo.getPageSize()) {
            fishHostLogVo.setPageSize(10);
        }

        //别名和类型
        SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
        sourceBuilder.query(boolQueryBuilder);

        int size = fishHostLogVo.getPageSize();

        sourceBuilder.from((fishHostLogVo.getPageNum() - 1) * size);
        sourceBuilder.size(size);
        sourceBuilder.sort(new FieldSortBuilder("procedureStartTime")
                .unmappedType("long").order(SortOrder.DESC));

        //别名，类型
        SearchRequest searchRequest = new SearchRequest().indices("evil").types("evil");
        //索引
        searchRequest.indices("evil");
        //各种组合条件
        searchRequest.source(sourceBuilder);
        //请求
        SearchResponse searchResponse = client.search(searchRequest, RequestOptions.DEFAULT);

        //返回结果
        SearchHits hits = searchResponse.getHits();
        logger.info("=========es查询返回结果总数：" + hits.totalHits);

        SearchHit[] hits1 = hits.getHits();
        List list = new ArrayList();
        for (SearchHit documentFields : hits1) {
            JSONObject obj = JSONObject.parseObject(documentFields.getSourceAsString());
            if(obj.getString(CITY) != null){
                obj.put(CITY, CityUtil.getCity(obj.getString(CITY)));
            }
            list.add(obj);
        }

        PageInfo<FishBlackHostVo> pageList = new PageInfo<>(list);
        int total = (int) hits.totalHits;
        pageList.setTotal(total);
        pageList.setPageNum(sv.getPageNum());
        pageList.setPageSize(sv.getPageSize());
        pageList.setPages(total%size == 0 ? total/size : total/size + 1);

        model.addAttribute("pageVo", pageList);
        model.addAttribute("form", sv);

        logger.info("==========es查询成功==========");
    } catch (IndexNotFoundException ife) {
        model.addAttribute("pageVo", new PageInfo<>(new ArrayList()));
        model.addAttribute("error", "es查询失败，索引未找到");
        logger.error("========es查询失败，索引未找到==========", ife);
    } catch (ConnectException ce) {
        model.addAttribute("pageVo", new PageInfo<>(new ArrayList()));
        model.addAttribute("error", "es查询失败，连接失败");
        logger.error("========es查询失败，连接失败==========", ce);
    } catch (Exception e) {
        model.addAttribute("pageVo", new PageInfo<>(new ArrayList()));
        model.addAttribute("error", "es查询失败，原因未知");
        logger.error("======es查询失败，原因未知========", e);
    }

    return "FishHostLog/FishHostLogList";
}
```

#### 3、相关博客

官网java-api：
https://www.elastic.co/guide/en/elasticsearch/client/java-rest/current/java-rest-high-search.html

参考博客：
https://blog.csdn.net/Imflash/article/details/101147730

https://www.cnblogs.com/wangzhuxing/p/9609127.html#_label2_2

##### 设置索引别名

```java
//获取所有索引
ActionFuture<IndicesStatsResponse> isr = client.admin().indices().stats(new IndicesStatsRequest().all());

Set<String> indexSet = isr.actionGet().getIndices().keySet();

for(String index : indexSet){
    client.admin().indices().prepareAliases().addAlias(index,"evil").execute().actionGet();
}
```
