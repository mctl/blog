#### 前言

使用准备好的word模版，动态填充数据，生成本地word文件

我用的是springboot+freemarker

### 1、导入依赖


```xml
<!-- freemarker -->
<dependency>
    <groupId>org.freemarker</groupId>
    <artifactId>freemarker</artifactId>
    <version>2.3.27-incubating</version>
</dependency>
```

### 2、word模版

#### 2.1 模版

事先创建一个word，把要动态填充的内容标记出来，然后保存为xml或ftl格式的，放入项目路径

ps1：建议ftl，有语法提示，编辑比较友好

ps2：项目路径建议写在配置文件，例如

```yml
# springboot配置文件
# 模版、word存放路径
report:
  template-path: /Users/Desktop/work/template
  word-path: /Users/Desktop/work/word
```
#### 2.2 数据准备

工具类里传入的数据为map，在模版中直接用键来获取值

#### 2.3 模版语法

语法基本上类似其他页面模版，这里记录我所用到的语法：

- 遍历：

```yml
<#list itemList as item>
    <w:r wsp:rsidRPr="00FE0EB1">
        <w:rPr>
            <w:rFonts w:hint="fareast"/>
            <wx:font
                    wx:val="宋体"/>
        </w:rPr>
        <w:t>${item.name}：</w:t>
    </w:r>
</#list>
```

- if条件：

```yml
<#if item?exists>
        <w:t>${item};</w:t>
    <#else >
        <w:t>0</w:t>
</#if>
```

- 图片：
这里多说两句...<br/><br/>1、如果想图片不变形，最好在java代码里按照图片比例算一个宽高出来，然后在模版style属性里直接用
<br/><br/>2、图片的w:name和src名称不能重复，我动态填写了image.name
<br/><br/>3、图片实际需要传入base64串来显示，这个可以在最开始的模版放一个图片来看看长啥样

```yml
<#list issue.images as image>
    <w:pict>
        <w:binData w:name="wordml://${image.name}"
                   xml:space="preserve">${image.base64}
</w:binData>
        <v:shape id="图片 2" o:spid="_x0000_i1027"
                 type="#_x0000_t75"
                 style="width:${image.width}pt;height:${image.height}pt;visibility:visible;mso-wrap-style:square">
            <v:imagedata src="wordml://${image.name}"
                         o:title=""/>
        </v:shape>
    </w:pict>
</w:r>
</w:p>
<w:p wsp:rsidR="00A576BC" wsp:rsidRPr="007D468A"
 wsp:rsidRDefault="00231249" wsp:rsidP="007D468A">
<w:pPr>
    <w:autoSpaceDE w:val="off"/>
    <w:autoSpaceDN w:val="off"/>
    <w:adjustRightInd w:val="off"/>
    <w:jc w:val="left"/>
    <w:rPr>
        <w:rFonts w:ascii="宋体" w:cs="宋体"
                  w:hint="fareast"/>
        <wx:font wx:val="宋体"/>
        <w:kern w:val="0"/>
        <w:sz w:val="18"/>
        <w:sz-cs w:val="18"/>
    </w:rPr>
</w:pPr>
<w:r wsp:rsidRPr="00231249">
    <w:rPr>
        <w:rFonts w:ascii="宋体" w:cs="宋体"/>
        <wx:font wx:val="宋体"/>
        <w:noProof/>
        <w:kern w:val="0"/>
        <w:sz w:val="18"/>
        <w:sz-cs w:val="18"/>
    </w:rPr>
</#list>
```

### 3、抽出工具类

这里直接贴一个亲测能用的工具类


```java
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import sun.misc.BASE64Encoder;

import javax.swing.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 * @author: Create by mctl
 */
public class WordReport {
    private static final Logger logger = LoggerFactory.getLogger(WordReport.class);

    //生成文件存放路径
    private String reportPath;
    //模版路径
    private String templatePath;
    //文件名
    private String fileName;
    //模版名
    private String templateName = "wordTemplate.ftl";

    //数据Map
    private Map dataMap;

    private File docFile;

    public WordReport(Map dataMap,String reportPath,String templatePath,String fileName){
        this.dataMap = dataMap;
        this.reportPath = reportPath;
        this.templatePath = templatePath;
        this.fileName = fileName;
    }

    public File createDoc()throws Exception{
        Writer docFileWriter = null;
        try {
            logger.info("开始生成模板信息...");
            Template template = this.createTemplate();
            logger.info("开始获取报告文件路径...");
            docFileWriter = this.createDocWrite();
            logger.info("开始生成报告....");
            template.process(this.dataMap,docFileWriter);
            logger.info("完成生成报告");
        } catch (IOException e) {
            logger.error("生成报告文件异常",e);
            throw new Exception("生成报告文件异常");
        } catch (TemplateException e) {
            logger.error("生成报告模板异常",e);
            throw new Exception("生成报告模板异常");
        } finally {
            if(null != docFileWriter){
                try {
                    docFileWriter.close();
                } catch (IOException e) {
                    logger.error("关闭报告writer异常");
                }
            }
        }
        return this.docFile;
    }

    private Template createTemplate() throws IOException {
        
        Configuration configuration = new Configuration();
        configuration.setDefaultEncoding("UTF-8");
        configuration.setDirectoryForTemplateLoading(new File(templatePath));
        Template template = configuration.getTemplate(templateName);
        template.setClassicCompatible(true);
        return template;
    }

    private Writer createDocWrite() throws IOException {
        this.docFile = new File(reportPath + File.separator + fileName);
        FileUtils.touch(this.docFile);
        return new BufferedWriter(new OutputStreamWriter(new FileOutputStream(this.docFile), StandardCharsets.UTF_8));
    }


    //图片处理，宽设定为200，高按原图片比例
    public static String[] getImageData(String imagePath){
        try {
            File img = new File(imagePath);
            ImageIcon image = new ImageIcon(imagePath);
            String imageWidth = "200",imageHeight = "";

            imageHeight = String.valueOf(image.getIconHeight() * 200 / image.getIconWidth());

            byte[] data = FileUtils.readFileToByteArray(img);

            BASE64Encoder encoder = new BASE64Encoder();
            return new String[]{imageWidth,imageHeight,encoder.encode(data)};
        }catch (Exception e){
            logger.error("获取图片二进制数据出现异常",e);
            e.printStackTrace();
            return new String[]{"","",""};
        }

    }
}

```


### 4、使用


```java
//service中可直接获取配置文件中的路径
@Value("${report.word-path}")
private String reportPath;

@Value("${report.template-path}")
private String templatePath;

Map<String,Object> dataMap = new HashMap<>(16);
//组装数据略

String fileName = "test.doc";

File report = new WordReport(dataMap,reportPath,templatePath,fileName).createDoc();
```

### 5、总结

总的来说，使用模版的方式比我之前生成excel的时候使用动态填充excel数据的方式要舒服，整体没什么难度，最多在模版上多花点功夫