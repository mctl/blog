### 1、mvn依赖

```xml
//后面的包不一定需要引入，主要第一个
<dependency>
	<groupId>org.elasticsearch.client</groupId>
	<artifactId>elasticsearch-rest-high-level-client</artifactId>
	<version>6.8.0</version>
</dependency>
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


### 2、使用
- 用户认证（后面提供第二种认证方式）
- 条件查询
- 遍历索引
- 给索引设置别名


```java
/**
 * 日志查询，从es接口查
 * @param model
 * @param fishHostLogVo
 * @return
 * @throws Exception
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
            procedureStartTime = QueryBuilders.rangeQuery("procedureStartTime")
                    .gte(fishHostLogVo.getCreateTimeStart());

            if (StringUtils.isNotBlank(fishHostLogVo.getCreateTimeEnd())) {
                procedureStartTime.lte(fishHostLogVo.getCreateTimeEnd());
            }
        } else {
            if (StringUtils.isNotBlank(fishHostLogVo.getCreateTimeEnd())) {
                procedureStartTime = QueryBuilders.rangeQuery("procedureStartTime")
                        .lte(fishHostLogVo.getCreateTimeEnd());
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
            list.add(JSONObject.parse(documentFields.getSourceAsString()));
        }

        PageInfo<FishBlackHostVo> pageList = new PageInfo<>(list);
        int total = (int) hits.totalHits;
        pageList.setTotal(total);
        pageList.setPageNum(sv.getPageNum());
        pageList.setPageSize(sv.getPageSize());
        pageList.setPages((int) Math.ceil(total / size) + 1);

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
#### 问题一：认证失败
系统上线某一天，突然发现上面的认证方式报错:

```java
{"error":{"root_cause":[{"type":"security_exception","reason":"missing authentication token for REST request [/evil*?master_timeout=30s&include_type_name=false&ignore_unavailable=false&expand_wildcards=open%2Cclosed&allow_no_indices=false]","header":{"WWW-Authenticate":"Basic realm=\"security\" charset=\"UTF-8\""}}],"type":"security_exception","reason":"missing authentication token for REST request [/evil*?master_timeout=30s&include_type_name=false&ignore_unavailable=false&expand_wildcards=open%2Cclosed&allow_no_indices=false]","header":{"WWW-Authenticate":"Basic realm=\"security\" charset=\"UTF-8\""}},"status":401
```
报错401，原因未知，curl命令可以，证明用户名密码没变，但是Java方式报错，而es部署在客户服务器上，没办法很好的调试，所以改用第二种认证方式，手动认证（此种方式可能需要注意安全性）

```java
//注意base64引入的包，如果报错提高jar版本
import org.apache.commons.codec.binary.Base64;

//创建RestHighLevelClient
try (RestHighLevelClient client = new RestHighLevelClient(
        RestClient.builder(
                new HttpHost(ES_IP, Integer.parseInt(ES_PORT)))
                .setDefaultHeaders(new BasicHeader[]{
                        new BasicHeader("Authorization","Basic " + Base64.encodeBase64String((USERNAME+":"+PASSWORD).getBytes()))
                })
)) {

    IndicesAliasesRequest aliasesRequest = new IndicesAliasesRequest();

    IndicesAliasesRequest.AliasActions aliasAction =
            new IndicesAliasesRequest.AliasActions(IndicesAliasesRequest.AliasActions.Type.ADD)
                    .index("test*")
                    .alias("test");

    aliasesRequest.addAliasAction(aliasAction);

    AcknowledgedResponse indicesAliasesResponse =client.indices().updateAliases(aliasesRequest,RequestOptions.DEFAULT);
    if(indicesAliasesResponse.isAcknowledged()){
        logger.info("======设置es索引别名成功========");
    }else{
        logger.error("=======设置es索引别名失败=========");
    }

}catch (Exception e){
    logger.error("=======设置es索引别名失败=========",e);
}
```
手动设置请求头认证的方式如果出现问题，考虑jar的原因，之前因为base64jar引入问题，折腾了很久...

此次debug反思：
- 该单步调试的就乖乖一步步看，不要跳，有些报错信息未必准确
- 考虑环境原因，可以将关键代码复制出来单独测试，然后定位问题

#### 问题二：分页查询报错
```java
from + size must be less than or equal to: [10000] but was [1615270]
```
原因其实已经说的很清楚了，es默认分页最大为一万，from + size的和不能大于这个值，但是我们可以自己设置一个更大的<code>max_result_window</code>

解决：一边设定查询日期控制查询数量，一边设置一个更大的值
```shell
//设置命令
curl -XPUT -H "Content-Type: application/json" --user username:password http://es-ip:9200/index/_settings -d '{ "index" : { "max_result_window" : 2000000}}'
```

#### 参考博客
```shell
手动认证：https://blog.csdn.net/qq_33689414/article/details/91880700
官方文档：https://www.elastic.co/guide/en/elasticsearch/client/java-rest/current/java-rest-high-search.html
```