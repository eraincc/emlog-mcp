# API开发文档

emlog pro版本支持接口（API）调用功能，开发者可以通过调用API来和emlog系统进行交互。如：对接文章发布软件，实现自动发布文章；对接微信小程序，实现多样化的文章展示；对接浏览器插件实现更便捷的笔记发布功能等。详细接口说明请参看下文内容。

提示

该文档以最新版本emlog pro为基础编写，低版本可能不兼容，请先升级到最新版本，并在后台api设置页面开启api。

## 接口鉴权[](https://www.emlog.net/docs/api/#接口鉴权)

### （1）API秘钥鉴权：签名鉴权[](https://www.emlog.net/docs/api/#1api秘钥鉴权签名鉴权)

- 请求方式：POST/GET
- 鉴权所需参数:

| 参数     | 是否必填 | 描述                                                |
| -------- | -------- | --------------------------------------------------- |
| req_sign | 必填     | 接口签名，见下方计算签名规则                        |
| req_time | 必填     | Unix时间戳，php可使用time()函数获取，如：1651591816 |

#### 计算签名规则[](https://www.emlog.net/docs/api/#计算签名规则)

将 unix时间戳 和 API秘钥 拼接后进行md5加密，API秘钥，在后台系统-设置-API 设置页面可以找到

php代码示例：

```php
$apikey = '******'; // API秘钥，在后台系统-设置-API 设置页面可以找到
$req_time = time(); // unix时间戳, 单位秒
$req_sign = md5($req_time . $apikey); // MD5签名
```



### （2）API秘钥鉴权：免签名鉴权[](https://www.emlog.net/docs/api/#2api秘钥鉴权免签名鉴权)

使用简单，但是安全性不如签名鉴权，建议配合https使用

- 请求方式：POST/GET
- 鉴权所需参数:

| 参数    | 是否必填 | 描述                                          |
| ------- | -------- | --------------------------------------------- |
| api_key | 必填     | API秘钥，在后台系统-设置-API 设置页面可以找到 |

### （3）cookie鉴权[](https://www.emlog.net/docs/api/#3cookie鉴权)

请求需要附带用户登录emlog系统后的登录状态cookie，用来识别当前登录状态及登录用户。

```text
// emlog登录状态cookie形如：
EM_AUTHCOOKIE_XXXXX=admin%7C0%7C2a12e9a651b7e44be3d2d3536f51eaaa; Path=/; HttpOnly;
```



## API列表[](https://www.emlog.net/docs/api/#api列表)

### 用户登录[](https://www.emlog.net/docs/api/#用户登录)

- 用户登录接口
- 接口URL：https://yourdomain/admin/account.php?action=dosignin
- 请求方式：POST
- 请求体格式：Form Data（application/x-www-form-urlencoded）
- 接口鉴权方式：无需鉴权
- 返回格式：JSON

#### 请求参数[](https://www.emlog.net/docs/api/#请求参数)

| 参数       | 是否必填 | 描述                            |
| ---------- | -------- | ------------------------------- |
| user       | 必填     | 用户名、邮箱                    |
| pw         | 必填     | 密码                            |
| persist    | 否       | 记住我，保留登录状态（传值：1） |
| login_code | 否       | 图片验证码                      |
| resp       | 必填     | 传递字符串 "json"               |

#### 返回结果（同时附带登录成功cookie）[](https://www.emlog.net/docs/api/#返回结果同时附带登录成功cookie)

```json
{
  "code": 0,
  "msg": "ok",
  "data": ""
}
```



### 用户注册[](https://www.emlog.net/docs/api/#用户注册)

- 用户注册接口
- 接口URL：https://yourdomain/admin/account.php?action=dosignup
- 请求方式：POST
- 请求体格式：Form Data（application/x-www-form-urlencoded）
- 接口鉴权方式：无需鉴权
- 返回格式：JSON

#### 请求参数[](https://www.emlog.net/docs/api/#请求参数-1)

| 参数       | 是否必填 | 描述              |
| ---------- | -------- | ----------------- |
| mail       | 必填     | 邮箱              |
| passwd     | 必填     | 密码              |
| repasswd   | 必填     | 重复密码          |
| login_code | 否       | 图片验证码        |
| mail_code  | 否       | 邮件验证码        |
| resp       | 必填     | 传递字符串 "json" |

#### 返回结果[](https://www.emlog.net/docs/api/#返回结果)

```json
{
  "code": 1,
  "msg": "错误的邮箱格式",
  "data": ""
}
```



### 找回密码：验证注册邮箱[](https://www.emlog.net/docs/api/#找回密码验证注册邮箱)

- 找回密码：验证注册邮箱接口
- 接口URL：https://yourdomain/admin/account.php?action=doreset
- 请求方式：POST
- 请求体格式：Form Data（application/x-www-form-urlencoded）
- 接口鉴权方式：无需鉴权
- 返回格式：JSON

#### 请求参数[](https://www.emlog.net/docs/api/#请求参数-2)

| 参数       | 是否必填 | 描述              |
| ---------- | -------- | ----------------- |
| mail       | 必填     | 邮箱              |
| login_code | 否       | 图片验证码        |
| resp       | 必填     | 传递字符串 "json" |

#### 返回结果[](https://www.emlog.net/docs/api/#返回结果-1)

```json
{
  "code": 0,
  "msg": "ok",
  "data": ""
}
```



### 找回密码：重置密码[](https://www.emlog.net/docs/api/#找回密码重置密码)

- 找回密码：重置密码接口
- 接口URL：https://yourdomain/admin/account.php?action=doreset2
- 请求方式：POST
- 请求体格式：Form Data（application/x-www-form-urlencoded）
- 接口鉴权方式：无需鉴权
- 返回格式：JSON

#### 请求参数[](https://www.emlog.net/docs/api/#请求参数-3)

| 参数      | 是否必填 | 描述              |
| --------- | -------- | ----------------- |
| mail_code | 是       | 邮件验证码        |
| passwd    | 必填     | 密码              |
| repasswd  | 必填     | 重复密码          |
| resp      | 必填     | 传递字符串 "json" |

#### 返回结果[](https://www.emlog.net/docs/api/#返回结果-2)

```json
{
  "code": 0,
  "msg": "ok",
  "data": ""
}
```



### 获取当前登录用户信息[](https://www.emlog.net/docs/api/#获取当前登录用户信息)

- 获取当前登录用户信息接口
- 接口URL：https://yourdomain/?rest-api=userinfo
- 请求方式：GET
- 接口鉴权方式：【cookie鉴权】
- 返回格式：JSON

#### 请求参数：无[](https://www.emlog.net/docs/api/#请求参数无)

#### 返回结果[](https://www.emlog.net/docs/api/#返回结果-3)

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "userinfo": {
      "uid": "1",
      "nickname": "emer",
      "role": "admin",
      "photo": "../content/uploadfile/202303/ad7b1678085402.jpg",
      "email": "",
      "description": "",
      "ip": "172.18.0.1",
      "create_time": "1677640065"
    }
  }
}
```



### 获取用户信息[](https://www.emlog.net/docs/api/#获取用户信息)

- 获取当前登录用户信息接口
- 接口URL：https://yourdomain/?rest-api=user_detail
- 请求方式：GET
- 接口鉴权方式：【API秘钥鉴权】
- 返回格式：JSON

#### 请求参数[](https://www.emlog.net/docs/api/#请求参数-4)

| 参数 | 是否必填 | 描述   |
| ---- | -------- | ------ |
| id   | 是       | 用户id |

#### 返回结果[](https://www.emlog.net/docs/api/#返回结果-4)

```json
{
    "code": 0,
    "msg": "ok",
    "data": {
        "userinfo": {
            "uid": 1,
            "nickname": "emer",
            "role": "admin",
            "avatar": "http://localhost/content/uploadfile/202408/ad7b1723864764.jpg",
            "description": "",
            "create_time": 1723271947
        }
    }
}
```



### 修改用户信息[](https://www.emlog.net/docs/api/#修改用户信息)

- 当前登录用户修改用户信息
- 接口URL：https://yourdomain/admin/blogger.php?action=update
- 请求方式：POST
- 接口鉴权方式：【cookie鉴权】
- 返回格式：JSON

#### 请求参数[](https://www.emlog.net/docs/api/#请求参数-5)

| 参数        | 是否必填 | 描述                                      |
| ----------- | -------- | ----------------------------------------- |
| token       | 是       | 后台令牌，获取方法：LoginAuth::genToken() |
| name        | 否       | 昵称                                      |
| description | 否       | 个人说明                                  |
| username    | 否       | 登录用户名                                |

#### 返回结果[](https://www.emlog.net/docs/api/#返回结果-5)

```json
{
  "code": 0,
  "msg": "ok",
  "data": ""
}
```



### 修改密码[](https://www.emlog.net/docs/api/#修改密码)

- 当前登录用户修改密码
- 接口URL：https://yourdomain/admin/blogger.php?action=change_password
- 请求方式：POST
- 请求体格式：Form Data（application/x-www-form-urlencoded）
- 接口鉴权方式：【cookie鉴权】
- 返回格式：JSON

#### 请求参数[](https://www.emlog.net/docs/api/#请求参数-6)

| 参数        | 是否必填 | 描述                                  |
| ----------- | -------- | ------------------------------------- |
| token       | 是       | 令牌，获取方法：LoginAuth::genToken() |
| new_passwd  | 否       | 新密码                                |
| new_passwd2 | 否       | 重复新密码                            |

#### 返回结果[](https://www.emlog.net/docs/api/#返回结果-6)

```json
{
  "code": 0,
  "msg": "ok",
  "data": ""
}
```



### 上传头像[](https://www.emlog.net/docs/api/#上传头像)

- 用户上传头像接口
- 接口URL：https://yourdomain/admin/blogger.php?action=update_avatar
- 请求方式：POST
- 请求体格式：Multipart Form Data (multipart/form-data)
- 接口鉴权方式：【cookie鉴权】
- 返回格式：JSON

#### 请求参数[](https://www.emlog.net/docs/api/#请求参数-7)

| 参数  | 是否必填 | 描述                                       |
| ----- | -------- | ------------------------------------------ |
| image | 是       | 表单提交的图片, PHP 获取：$_FILES["image"] |

#### 返回结果[](https://www.emlog.net/docs/api/#返回结果-7)

```json
{
    "code": 0,
    "msg": "ok",
    "data": "..\/content\/uploadfile\/202310\/ad7b1696580183.jpg"
}
```



### 发布评论[](https://www.emlog.net/docs/api/#发布评论)

- 发布评论接口
- 接口URL：https://yourdomain/index.php?action=addcom
- 请求方式：POST
- 请求体格式：Form Data（application/x-www-form-urlencoded）
- 接口鉴权方式：无需鉴权
- 返回格式：JSON

#### 请求参数[](https://www.emlog.net/docs/api/#请求参数-8)

| 参数    | 是否必填 | 描述               |
| ------- | -------- | ------------------ |
| gid     | 必填     | 文章id             |
| comname | 必填     | 评论人名称         |
| comment | 必填     | 评论内容           |
| commail | 否       | 评论人邮箱         |
| comurl  | 否       | 评论人主页地址     |
| avatar  | 否       | 评论人头像图片 URL |
| imgcode | 否       | 图片验证码         |
| pid     | 否       | 被回复评论ID       |
| resp    | 必填     | 传递字符串 "json"  |

#### 返回结果[](https://www.emlog.net/docs/api/#返回结果-8)

```json
{
    "code": 0,
    "msg": "ok",
    "data": {
        "cid": 4
    }
}
```



### 评论点赞[](https://www.emlog.net/docs/api/#评论点赞)

- 评论点赞接口
- 接口URL：https://yourdomain/index.php?action=likecom
- 请求方式：POST
- 请求体格式：Form Data（application/x-www-form-urlencoded）
- 接口鉴权方式：无需鉴权
- 返回格式：JSON

#### 请求参数[](https://www.emlog.net/docs/api/#请求参数-9)

| 参数 | 是否必填 | 描述   |
| ---- | -------- | ------ |
| cid  | 必填     | 评论id |

#### 返回结果[](https://www.emlog.net/docs/api/#返回结果-9)

```json
{
    "code": 0,
    "msg": "ok",
    "data": ""
}
```



### 评论列表[](https://www.emlog.net/docs/api/#评论列表)

- 获取文章的评论列表接口
- 接口URL：https://yourdomain/?rest-api=comment_list
- 请求方式：GET
- 接口鉴权方式：无需鉴权
- 返回格式：JSON

#### 请求参数[](https://www.emlog.net/docs/api/#请求参数-10)

| 参数 | 是否必填 | 描述                                 |
| ---- | -------- | ------------------------------------ |
| id   | 是       | 文章ID                               |
| page | 否       | 评论分页，需后台设置开启评论分页功能 |

#### 返回结果[](https://www.emlog.net/docs/api/#返回结果-10)

```json
{
    "code": 0,
    "msg": "ok",
    "data": {
        "comments": {
            "1": {
                "cid": "1",
                "gid": "1",
                "pid": "0",
                "top": "n",
                "poster": "snow",
                "uid": "0",
                "comment": "stay hungry stay foolish",
                "mail": "",
                "url": "",
                "ip": "",
                "agent": "",
                "hide": "n",
                "date": "57 分钟前",
                "content": "stay hungry stay foolish",
                "children": [],
                "level": 0
            }
        },
        "commentStacks": [],
        "commentPageUrl": ""
    }
}
```



### 评论列表-v2[](https://www.emlog.net/docs/api/#评论列表-v2)

- 获取文章的评论列表接口
- 接口URL：https://yourdomain/?rest-api=comment_list_simple
- 请求方式：GET
- 接口鉴权方式：无需鉴权
- 返回格式：JSON

#### 请求参数[](https://www.emlog.net/docs/api/#请求参数-11)

| 参数 | 是否必填 | 描述   |
| ---- | -------- | ------ |
| id   | 是       | 文章id |

#### 返回结果[](https://www.emlog.net/docs/api/#返回结果-11)

```json
{
    "code": 0,
    "msg": "ok",
    "data": {
        "comments": [
            {
                "cid": "1",
                "gid": "1",
                "pid": "0",
                "top": "n",
                "poster": "emlog",
                "avatar": "http://localhost:8080/admin/views/images/avatar.svg",
                "uid": "0",
                "comment": "这是系统生成的演示评论",
                "mail": "",
                "url": "",
                "ip": "",
                "agent": "",
                "hide": "n",
                "date": "2024-09-28 22:06",
                "content": "这是系统生成的演示评论",
                "children": [
                    {
                        "cid": "2",
                        "gid": "1",
                        "pid": "1",
                        "top": "n",
                        "poster": "emer",
                        "avatar": "http://localhost:8080/",
                        "uid": "1",
                        "comment": "@emlog：这是测试评论",
                        "mail": "",
                        "url": "http://localhost:8080/",
                        "ip": "192.168.65.1",
                        "agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
                        "hide": "n",
                        "date": "3 秒前",
                        "content": "@emlog：这是测试评论",
                        "children": []
                    }
                ]
            }
        ]
    }
}
```



### 文章点赞[](https://www.emlog.net/docs/api/#文章点赞)

- 文章点赞接口
- 接口URL：https://yourdomain/index.php?action=addlike
- 请求方式：POST
- 请求体格式：Form Data（application/x-www-form-urlencoded）
- 接口鉴权方式：无需鉴权
- 返回格式：JSON

#### 请求参数[](https://www.emlog.net/docs/api/#请求参数-12)

| 参数   | 是否必填 | 描述               |
| ------ | -------- | ------------------ |
| gid    | 是       | 文章id             |
| name   | 否       | 点赞人名称         |
| avatar | 否       | 点赞人头像图片 URL |

#### 返回结果[](https://www.emlog.net/docs/api/#返回结果-12)

```json
{
    "code": 0,
    "msg": "ok",
    "data": {
        "id": 2
    }
}
```



### 取消文章点赞[](https://www.emlog.net/docs/api/#取消文章点赞)

- 文章取消点赞接口， 目前只支持登录用户取消点赞。
- 接口URL：https://yourdomain/index.php?action=unlike
- 请求方式：POST
- 请求体格式：Form Data（application/x-www-form-urlencoded）
- 接口鉴权方式：【cookie鉴权】
- 返回格式：JSON

#### 请求参数[](https://www.emlog.net/docs/api/#请求参数-13)

| 参数 | 是否必填 | 描述   |
| ---- | -------- | ------ |
| gid  | 是       | 文章id |

#### 返回结果[](https://www.emlog.net/docs/api/#返回结果-13)

```json
{
    "code": 0,
    "msg": "ok",
    "data": {}
}
```



### 获赞列表[](https://www.emlog.net/docs/api/#获赞列表)

- 获取文章点赞列表
- 接口URL：https://yourdomain/?rest-api=like_list
- 请求方式：GET
- 接口鉴权方式：无需鉴权
- 返回格式：JSON

#### 请求参数[](https://www.emlog.net/docs/api/#请求参数-14)

| 参数 | 是否必填 | 描述   |
| ---- | -------- | ------ |
| id   | 否       | 文章id |

#### 返回结果[](https://www.emlog.net/docs/api/#返回结果-14)

```json
{
    "code": 0,
    "msg": "ok",
    "data": {
        "likes": [
            {
                "id": 1,
                "gid": 1,
                "poster": "snowsun",
                "avatar": "https://oss.emlog.cn/avatar/avatar_y4LueUW71K3rIvxn.png?imageMogr2/thumbnail/200x",
                "uid": 0,
                "ip": "192.168.65.1",
                "agent": "PostmanRuntime/7.41.2",
                "date": "约 9 小时前"
            }
        ]
    }
}
```



### 文章发布[](https://www.emlog.net/docs/api/#文章发布)

- 文章发布接口，可用于对接文章发布软件
- 接口URL：https://yourdomain/?rest-api=article_post
- 请求方式：POST
- 请求体格式：Form Data（application/x-www-form-urlencoded）
- 接口鉴权方式：【API秘钥鉴权】 或者 【cookie鉴权】
- 返回格式：JSON

#### 请求参数[](https://www.emlog.net/docs/api/#请求参数-15)

| 参数           | 是否必填 | 描述                                             |
| -------------- | -------- | ------------------------------------------------ |
| title          | 必填     | 文章标题                                         |
| content        | 必填     | 文章内容                                         |
| excerpt        | 否       | 文章摘要                                         |
| cover          | 否       | 文章封面                                         |
| author_uid     | 否       | 作者的用户ID，可在后台用户管理页面查看           |
| sort_id        | 否       | 文章分类ID，可在后台分类管理页面查看             |
| tags           | 否       | 文章标签，多个半角逗号分隔，如：PHP,MySQL        |
| draft          | 否       | 是否发布为草稿，是y， 否n （默认为n）            |
| post_date      | 否       | 发布时间，如：`2022-05-03 23:30:16`              |
| top            | 否       | 首页置顶，是y，否n，默认否                       |
| sortop         | 否       | 分类置顶，是y，否n，默认否                       |
| allow_remark   | 否       | 允许评论，是y，否n，默认否                       |
| password       | 否       | 文章访问密码                                     |
| link           | 否       | 文章跳转链接，填写后不展示文章内容直接跳转该地址 |
| field_keys[]   | 否       | 自定义字段名称，如价格：price                    |
| field_values[] | 否       | 自定义字段值，如价格的值：9.9                    |
| auto_cover     | 否       | 自动获取文章内图片作为封面，是y，否n             |

#### 返回结果[](https://www.emlog.net/docs/api/#返回结果-15)

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "article_id": 14
  }
}
```



### 文章编辑[](https://www.emlog.net/docs/api/#文章编辑)

- 文章编辑接口
- 接口URL：https://yourdomain/?rest-api=article_update
- 请求方式：POST
- 请求体格式：Form Data（application/x-www-form-urlencoded）
- 接口鉴权方式：【API秘钥鉴权】 或者 【cookie鉴权】
- 返回格式：JSON

#### 请求参数[](https://www.emlog.net/docs/api/#请求参数-16)

| 参数       | 是否必填 | 描述                                      |
| ---------- | -------- | ----------------------------------------- |
| id         | 必填     | 文章ID                                    |
| title      | 必填     | 文章标题                                  |
| content    | 否       | 文章内容                                  |
| excerpt    | 否       | 文章摘要                                  |
| cover      | 否       | 文章封面                                  |
| author_uid | 否       | 作者的用户ID，可在后台用户管理页面查看    |
| sort_id    | 否       | 文章分类ID，可在后台分类管理页面查看      |
| tags       | 否       | 文章标签，多个半角逗号分隔，如：PHP,MySQL |
| draft      | 否       | 是否发布为草稿，是y， 否n （默认为n）     |
| post_date  | 否       | 发布时间，如：`2022-05-03 23:30:16`       |

#### 返回结果[](https://www.emlog.net/docs/api/#返回结果-16)

```json
{
  "code": 0,
  "msg": "ok",
  "data": ""
}
```



### 文章列表[](https://www.emlog.net/docs/api/#文章列表)

- 获取文章的列表接口
- 接口URL：https://yourdomain/?rest-api=article_list
- 请求方式：GET
- 接口鉴权方式：无需鉴权，无需开启API
- 返回格式：JSON

#### 请求参数[](https://www.emlog.net/docs/api/#请求参数-17)

| 参数    | 是否必填 | 描述                                                         |
| ------- | -------- | ------------------------------------------------------------ |
| page    | 否       | 第几页，默认从1开始                                          |
| count   | 否       | 每页文章数量，默认跟随后台设置                               |
| sort_id | 否       | 文章分类ID，可在后台分类管理页面查看                         |
| keyword | 否       | 搜索关键词，仅匹配文章标题                                   |
| tag     | 否       | 文章标签                                                     |
| order   | 否       | 文章排序，默认按照时间倒序排序，views：按照浏览量倒序排序，comnum：按照评论数倒序排序 |

#### 返回结果[](https://www.emlog.net/docs/api/#返回结果-17)

```json
{
    "code": 0,
    "msg": "ok",
    "data": {
        "articles": [
        {
          "id": 31908,
          "title": "这里是文章标题",
          "cover": "",
          "url": "https://www.emlog.dev/post/31908",
          "description": "这里是文章的摘要内容",
          "date": "2021-10-11 08:04:11",
          "author_id": 3,
          "author_name": "张三",
          "author_avatar": "http://localhost/content/uploadfile/202408/ad7b1723864764.jpg",
          "sort_id": 53,
          "sort_name": "分类名称",
          "views": 1,
          "comnum": 0,
          "like_count": 1,
          "top": "y",
          "sortop": "n",
          "tags": [
            {
            "name": "emlog",
            "url": "http://localhost:8080/?tag=emlog"
            }
          ],
          "need_pwd": "y",
          "fields": {
            "price": "9.9",
            "color": "#ffffff"
          }
        }
      ],
      "page": 1,
      "total_pages": 3,
      "has_more": true
    }
}
```



### 文章详情[](https://www.emlog.net/docs/api/#文章详情)

- 获取文章的详情接口
- 接口URL：https://yourdomain/?rest-api=article_detail
- 请求方式：GET
- 接口鉴权方式：无需鉴权
- 返回格式：JSON

#### 请求参数[](https://www.emlog.net/docs/api/#请求参数-18)

| 参数     | 是否必填 | 描述                               |
| -------- | -------- | ---------------------------------- |
| id       | 是       | 文章ID                             |
| password | 否       | 文章密码，用于访问设置了密码的文章 |

#### 返回结果[](https://www.emlog.net/docs/api/#返回结果-18)

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "article": {
      "title": "文章的标题",
      "date": "2022-06-04 10:42:12",
      "id": 54215,
      "sort_id": -1,
      "sort_name": "",
      "type": "blog",
      "author_id": "1",
      "author_name": "snowsun",
      "author_avatar": "http://localhost/content/uploadfile/202408/ad7b1723864764.jpg",
      "content": "<p>文章的内容</p>",
      "excerpt": "<p>这里是文章的摘要</p>",
      "cover": "文章封面",
      "views": 2,
      "comnum": 0,
      "like_count": 1,
      "top": "n",
      "sortop": "n",
      "tags": [
                {
                    "name": "emlog",
                    "url": "http://localhost/?tag=emlog"
                }
            ],
      "fields": {
            "price": "9.9",
            "color": "#ffffff",
      }
    }
  }
}
```



#### 文章字段说明[](https://www.emlog.net/docs/api/#文章字段说明)

| 参数            | 描述                          |
| --------------- | ----------------------------- |
| id              | 文章ID                        |
| title           | 文章标题                      |
| cover           | 文章封面图                    |
| url             | 文章URL                       |
| description     | 文章列表摘要                  |
| description_raw | 文章列表摘要（markdown 原文） |
| content         | 文章详情内容                  |
| content_raw     | 文章详情内容（markdown 原文） |
| excerpt         | 文章详情摘要                  |
| excerpt_raw     | 文章详情摘要（markdown 原文） |
| date            | 发布日期                      |
| author_id       | 作者ID                        |
| author_name     | 作者昵称                      |
| author_avatar   | 作者头像                      |
| sort_id         | 分类ID                        |
| sort_name       | 分类名称                      |
| views           | 阅读数                        |
| comnum          | 评论数                        |
| like_count      | 点赞数                        |
| top             | 首页置顶 y是 n否              |
| sortop          | 分类置顶 y是 n否              |
| tags            | 标签                          |
| need_pwd        | 是否设置密码 y是 n否          |
| fields          | 自定义字段                    |

### 分类列表[](https://www.emlog.net/docs/api/#分类列表)

- 获取全部分类列表（包括子分类栏目）接口
- 接口URL：https://yourdomain/?rest-api=sort_list
- 请求方式：GET
- 接口鉴权方式：无需鉴权
- 返回格式：JSON

#### 请求参数：无[](https://www.emlog.net/docs/api/#请求参数无-1)

#### 返回结果[](https://www.emlog.net/docs/api/#返回结果-19)

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "sorts": [
      {
        "lognum": "0",
        "sortname": "体育栏目",
        "description": "",
        "alias": "sport",
        "sid": 1,
        "taxis": 0,
        "pid": 0,
        "template": "",
        "children": [
          {
            "lognum": "0",
            "sortname": "足球",
            "description": "",
            "alias": "football",
            "sid": 2,
            "taxis": 0,
            "pid": 1,
            "template": ""
          }
        ]
      }
    ]
  }
}
```



### 微语笔记发布[](https://www.emlog.net/docs/api/#微语笔记发布)

- 微语笔记发布接口
- 接口URL：https://yourdomain/?rest-api=note_post
- 请求方式：POST
- 请求体格式：Form Data（application/x-www-form-urlencoded）
- 接口鉴权方式：【API秘钥鉴权】 或者 【cookie鉴权】
- 返回格式：JSON

#### 请求参数[](https://www.emlog.net/docs/api/#请求参数-19)

| 参数       | 是否必填 | 描述                                   |
| ---------- | -------- | -------------------------------------- |
| t          | 必填     | 微语笔记内容                           |
| private    | 否       | 是否私密，y私密，n公开，默认公开       |
| author_uid | 否       | 作者的用户ID，可在后台用户管理页面查看 |

#### 返回结果[](https://www.emlog.net/docs/api/#返回结果-20)

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "note_id": 4
  }
}
```



### 微语笔记列表[](https://www.emlog.net/docs/api/#微语笔记列表)

- 获取微语笔记的列表接口
- 接口URL：https://yourdomain/?rest-api=note_list
- 请求方式：GET
- 接口鉴权方式：【API秘钥鉴权】 或者 【cookie鉴权】
- 返回格式：JSON

#### 请求参数[](https://www.emlog.net/docs/api/#请求参数-20)

| 参数       | 是否必填 | 描述                                   |
| ---------- | -------- | -------------------------------------- |
| page       | 否       | 第几页，默认从1开始                    |
| count      | 否       | 每页文章数量，默认跟随后台设置         |
| author_uid | 否       | 作者的用户ID，可在后台用户管理页面查看 |

#### 返回结果[](https://www.emlog.net/docs/api/#返回结果-21)

```json
{
    "code": 0,
    "msg": "ok",
    "data": {
        "notes": [
            {
                "t": "<h1>test note</h1>",
                "t_raw": "# test note",
                "date": "47 秒前",
                "author_id": 1,
                "author_name": "emer"
            },
            ...
            ,
        ]
    }
}
```



### 资源文件上传[](https://www.emlog.net/docs/api/#资源文件上传)

- 上传图片、zip包等资源文件
- 接口URL：https://yourdomain/?rest-api=upload
- 请求方式：POST
- 请求体格式：Form Data（application/x-www-form-urlencoded）
- 接口鉴权方式：【API秘钥鉴权】
- 返回格式：JSON

#### 请求参数[](https://www.emlog.net/docs/api/#请求参数-21)

| 参数       | 是否必填 | 描述                                   |
| ---------- | -------- | -------------------------------------- |
| file       | 必填     | 文件，要上传的媒体文件（二进制文件）   |
| author_uid | 否       | 作者的用户ID，可在后台用户管理页面查看 |
| sid        | 否       | 资源分类ID                             |

#### 返回结果[](https://www.emlog.net/docs/api/#返回结果-22)

```json
{
    "code": 0,
    "msg": "ok",
    "data": {
        "media_id": 80,
        "url": "http://yourdomain/content/uploadfile/202307/7e6f1690266418.png",
        "file_info": {
            "file_name": "icon-1024.png",
            "mime_type": "image/png",
            "size": 258642,
            "width": 1024,
            "height": 1024,
            "file_path": "../content/uploadfile/202307/7e6f1690266418.png",
            "thum_file": "../content/uploadfile/202307/thum-7e6f1690266418.png"
        }
    }
}
```



## 常见错误信息[](https://www.emlog.net/docs/api/#常见错误信息)

- 报错返回格式：json

| 错误信息                  | 描述                        | http状态码 |
| ------------------------- | --------------------------- | ---------- |
| sign error                | 签名错误                    | 401        |
| api is closed             | 未开启API，请在后台设置开启 | 400        |
| API function is not exist | 不存在的API方法             | 400        |
| parameter error           | 必填参数缺失                | 400        |

### 错误返回示例[](https://www.emlog.net/docs/api/#错误返回示例)

```json
{
  "code": 1,
  "msg": "sign error",
  "data": ""
}
```



------

## 调用示例[](https://www.emlog.net/docs/api/#调用示例)

### PHP调用示例[](https://www.emlog.net/docs/api/#php调用示例)

PHP调用示例（发布微语笔记）

```php
<?php

// API秘钥，在后台系统-设置-API接口设置里可以找到
$apikey = 'your_api_key';

// 请求参数
$data = array(
    't' => '这是一篇测试微语笔记',
    'author_uid' => '1',
    'api_key' => $apikey
);

// 请求URL
$url = 'https://yourdomain/?rest-api=note_post';

$ch = curl_init();
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));// 设置请求参数
curl_setopt($ch, CURLOPT_URL, $url);// 设置请求URL
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);// 设置返回结果不直接输出
$response = curl_exec($ch);// 执行请求并获取响应数据
curl_close($ch);// 关闭curl

echo $response; // 输出响应结果
```



### python调用示例[](https://www.emlog.net/docs/api/#python调用示例)

python调用示例（发布微语笔记）

```python
import time
import hashlib
import requests

# API秘钥，在后台系统-设置-API接口设置里可以找到
apikey = 'your_api_key'

# 请求参数
data = {
    't': '这是一篇测试微语笔记',
    'author_uid': '1',
    'api_key': apikey
}

# 请求URL
url = 'https://yourdomain/?rest-api=note_post'
response = requests.post(url, data=data)
print(response.text) # 输出响应结果
```



### js调用示例[](https://www.emlog.net/docs/api/#js调用示例)

js调用示例（发布评论）

```js
// 使用了jquery
// 获取表单数据
const gid = $('#gid').val();
const comname = $('#comname').val();
const comment = $('#comment').val();
const commail = $('#commail').val();
const comurl = $('#comurl').val();
const imgcode = $('#imgcode').val();
const pid = $('#pid').val();
const resp = $('#resp').val();

// 发送 POST 请求
$.post('https://yourdomain/index.php?action=addcom', {
    gid: gid,
    comname: comname,
    comment: comment,
    commail: commail,
    comurl: comurl,
    imgcode: imgcode,
    pid: pid,
    resp: resp
}).done(function (response) {
    if (response.code === 0) {
        alert('评论成功！');
        // 刷新页面或其他操作
    } else {
        alert(response.msg);
    }
}).fail(function (jqXHR, textStatus, errorThrown) {
    console.log('请求失败：' + textStatus);
});
```



### 文件上传示例[](https://www.emlog.net/docs/api/#文件上传示例)

PHP 实现上传图片示例

```php
<?php

// API秘钥，在后台系统-设置-API接口设置里可以找到
$apikey = 'your_api_key';

// 请求URL
$url = 'https://yourdomain/?rest-api=upload';

// 要上传的文件路径
$file_path = '/path/to/your/file.png';

// 构造POST数据
$post_data = array(
    'file' => new CURLFile($file_path),
    'sid' => 1, // 资源分类ID，如果不需要可以省略
    'api_key' => $apikey
);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);// 设置请求URL
curl_setopt($ch, CURLOPT_POST, 1);// 设置为POST请求
curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);// 设置POST数据
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);// 设置返回结果不直接输出
$response = curl_exec($ch);// 执行请求并获取响应数据

// 检查是否有错误发生
if (curl_errno($ch)) {
    echo 'Error: ' . curl_error($ch);
} else {
    // 解析JSON格式的响应数据
    $json_response = json_decode($response, true);
    if ($json_response['code'] === 0) {
        echo 'Upload successful! Media ID: ' . $json_response['data']['media_id'];
        echo 'File URL: ' . $json_response['data']['url'];
    } else {
        echo 'Upload failed: ' . $json_response['msg'];
    }
}

curl_close($ch);// 关闭curl
```