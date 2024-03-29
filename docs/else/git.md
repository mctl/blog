1、新建及切换分支

```shell
//新建分支testing
git branch testing
//切换分支
git checkout testing

//上面两句简写
git checkout -b testing

//新建远程分支
//在上面的基础上直接推送本地分支即可
git push origin testing:testing

//删除远程分支
//1、推送一个空分支，等于删除
git push origin :testing

//2、删除分支
git push origin --delete testing

```

2、提交

```shell
git commit -a -m 'fix bug'
```

2.1、重新提交
如果提交后发现有文件漏掉可以重新提交

```shell
git commit -m 'initial commit'
git add forgotten_file
git commit --amend
```

2.2、取消暂存的文件
如果 add 了两个文件，想取消其中一个

```shell
git reset HEAD test.txt
```

2.3、撤销对文件的修改
还原成上次提交的样子

```shell
git checkout -- test.txt
```

3、合并分支到 master

```shell
git checkout master
git merge testing
```

4、删除分支

```shell
git branch -d testing
```

5、标记冲突已解决

```shell
git add
```

6、查看当前状态

```shell
git status
```

7、本地分支开发，远程合并流程

```shell
//本地开发gshdev分支，需合并到develop分支
//提交本地代码
git commit -a -m ''
//拉取远程develop分支
git pull origin develop
//push本地代码到远程分支
git push origin gshdev
//在gitlab发起merge requert
//source--》gshdev
//target--》develop
```

8、代码回滚

8.1 revert

会创建一次新的 commit，抵消掉上一次提交。如果有多次 commit 需要回滚，就需要执行

```shell
git revert [倒数第一次commit id] [倒数第二次id]
```

8.2 reset

reset 可以把提交的 commit 从历史记录中完全消失，但是可能会有丢失代码的风险，慎用

```shell
git reset [某次commit id]

//reset后由于本地落后与仓库代码，需要强行提交
git push -f
```

解决报错：2021.8.13，Support for password authentication was removed. Please use a personal access token instead [duplicate]

首先推荐使用 ssh，不需要这么麻烦，如果非要用 https，需要按照以下操作增加 token

My Account > Settings > Developer settings > Personal access tokens GENERATE NEW TOKEN

```shell
git remote set-url origin https://<token>@github.com/<username>/<repo>
```

查看配置项

```shell
git config --list
git config remote.origin.url
```
