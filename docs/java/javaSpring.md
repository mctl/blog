spring配置文件中bean下添加
```xml
<!-- html视图解析器 -->
<bean id="freemarkerConfig" class="org.springframework.web.servlet.view.freemarker.FreeMarkerConfigurer">
    <!-- 路径从webapp开始填起 -->
    <property name="templateLoaderPath" value="/asset/" />
    <property name="freemarkerSettings">
        <props>
            <!--<prop key="template_update_delay">1</prop>-->
            <!-- 解决html页面乱码问题，其他几项未用到 -->
            <prop key="default_encoding">UTF-8</prop>
            <!--<prop key="number_format">0.##</prop>-->
            <!--<prop key="datetime_format">yyyy-MM-dd HH:mm:ss</prop>-->
        </props>
    </property>
</bean>
<bean id="htmlviewResolver" class="org.springframework.web.servlet.view.freemarker.FreeMarkerViewResolver">
    <property name="suffix" value=".html"/>
    <property name="order" value="0" />
    <property name="contentType" value="text/html;charset=UTF-8" />
</bean>

<!-- jsp视图解析器 -->
<bean id="jspViewResolver" class="org.springframework.web.servlet.view.InternalResourceViewResolver">
    <property name="viewClass" value="org.springframework.web.servlet.view.InternalResourceView"/>
    <property name="prefix" value="/WEB-INF/view/"/>
    <property name="suffix" value=".jsp"/>
    <property name="contentType" value="text/html;charset=UTF-8"/>
    <property name="order" value="1"/>
</bean>
```