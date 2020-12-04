#### 1、html

```java
handleClick(row) {
    //下载地址
	let url = '/api/taskLog/download?downloadUrl=' + logPath;
	
	window.open(encodeURI(url));
},
```

#### 2、mvn

```xml
<dependency>
    <groupId>org.apache.directory.studio</groupId>
    <artifactId>org.apache.commons.io</artifactId>
    <version>2.4</version>
</dependency>
```


#### 2、controller

```java
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;

@RequestMapping("download")
@ResponseBody
public String download(@RequestParam(name = "downloadUrl",required = false) String downloadUrl,
        HttpServletResponse response) {

    if(StringUtils.isBlank(downloadUrl) || StringUtils.isEmpty(downloadUrl)){
        return "下载地址为空";
    }

    OutputStream out = null;
    try {
        out = response.getOutputStream();

        downloadUrl = URLDecoder.decode(downloadUrl,"utf-8");

        File file = new File(downloadUrl);

        response.setContentType("application/x-msdownload");
        response.setHeader("Content-Disposition", "attachment; filename=" + (
                new String(FilenameUtils.getName(downloadUrl).getBytes("gb2312"), "ISO8859-1"))
                .replaceAll(",", ""));

        response.setContentLength((int) file.length());

        byte[] fileBytes = FileUtils.readFileToByteArray(file);
        IOUtils.write(fileBytes, out);

        return "下载成功";

    } catch (Exception e) {
        logger.error("下载文件出错", e);
    } finally {
        IOUtils.closeQuietly(out);
    }

    return "下载失败";
}
```

