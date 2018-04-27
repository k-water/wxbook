//app.js

const api = require('./config/config')

App({
  // 生命周期函数--监听小程序初始化
  onLaunch: function () {
    let that = this
    that.checkLoginStatus()
  },


  checkLoginStatus: function () {
    let that = this
    let loginFlag = wx.getStorageSync('loginFlag')
    if (loginFlag) {
      // 校验用户当前session_key是否有效
      wx.checkSession({
        success: function () {
          let userStorageInfo = wx.getStorageSync('userInfo')
          if (userStorageInfo) {
            that.globalData.userInfo = JSON.parse(userStorageInfo)
          } else {
            that.showInfo('缓存信息缺失')
            console.error('登录成功后将用户信息存在Storage的userStorageInfo字段中，该字段丢失')
          }
        },
        // session key过期
        fail: function () {
          that.doLogin()
        }
      })
    } else {
      that.doLogin()
    }
  },
  /**
   * wx.login => wx.getUserInfo => wx.request (api.loginUrl)
   */
  doLogin: function (callback = () => {}) {
    let that = this
    wx.login({
      success: function (loginRes) {
        if (loginRes.code) {
          wx.getUserInfo({
            // 是否带上登录态信息
            withCredentials: true,

            success: function (infoRes) {
              // success
              console.log(infoRes)

              /**
               * @desc: 获取用户信息 期望数据如下 
               *
               * @param: userInfo       [Object]
               * @param: rawData        [String]
               * @param: signature      [String]
               * @param: encryptedData  [String]
               * @param: iv             [String]
               */
              // 请求服务端登录接口
              wx.request({
                url: api.loginUrl,
                data: {
                  // 临时登录凭证code 
                  code: loginRes.code,
                  // 用户非敏感信息
                  rawData: infoRes.rawData,
                  // 签名
                  signature: infoRes.signature,
                  // 用户敏感信息
                  encryptedData: infoRes.encryptedData,
                  // 解密算法的向量
                  iv: infoRes.iv
                },
                method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                // header: {}, // 设置请求的 header
                success: function (res) {
                  // success
                  console.log(res)
                  console.log('login success')
                  res = res.data

                  if (res.result == 0) {
                    that.globalData.userInfo = res.userInfo
                    wx.setStorageSync('userInfo', JSON.stringify(res.userInfo))
                    wx.setStorageSync('loginFlag', res.skey)
                    callback()
                  } else {
                    that.showInfo(res.errmsg)
                  }
                },
                fail: function (error) {
                  // fail
                  that.showInfo('调用接口失败')
                  console.log(error)
                }
              })
            },
            fail: function (error) {
              // fail
              // 获取 userInfo 失败 检查是否未开启权限
              wx.hideLoading()
              that.checkUserInfoPermission()
            }
          })
        } else {
          // 获取 code 失败
          that.showInfo('登录失败');
          console.log('调用wx.login获取code失败');
        }
      },
      fail: function (error) {
        // 调用wx.login接口失败
        that.showInfo('接口调用失败')
        console.error(error)
      }
    })
  },

  // 检查用户信息授权设置
  checkUserInfoPermission: function (callback = () => {}) {
    // 获取用户的当前设置
    wx.getSetting({
      success: function (res) {
        if (!res.authSetting['scope.userInfo']) {
          wx.openSetting({
            success: function (authSetting) {
              console.log(authSetting)
            }
          })
        }
      },
      fail: function (error) {
        console.log(error)
      }
    })
  },

  getLoginFlag: function () {
    return wx.getStorageSync('loginFlag')
  },

  showInfo: function (info = 'error', icon = 'none') {
    wx.showToast({
      title: info,
      icon,
      duration: 1500,
      mask: true
    })
  },

  // 获取已下载书籍路径
  getDownloadPath: function (key) {
    return wx.getStorageSync(key)
  },

  // 将已下载的文件保存到本地
  saveDownloadPath: function (key, filePath) {
    return new Promise((resolve, reject) => {
      wx.saveFile({
        tempFilePath: filePath,
        success: function (res) {
          // success
          let saveFilePath = res.saveFilePath
          wx.setStorageSync(key, saveFilePath)
          resolve(saveFilePath)
        },
        fail: function () {
          // fail
          reject(false)
        },
        complete: function () {
          // complete
        }
      })
    })
  },
  openBook: function (filePath) {
    wx.openDocument({
      filePath: filePath,
      success: function (res) {
        // success
        console.log('打开文档成功')
      },
      fail: function (error) {
        // fail
        console.log(error)
      },
      complete: function () {
        // complete
      }
    })
  },

  // app全局数据
  globalData: {
    userInfo: null
  }
})