const app = getApp()
Page({
  data: {
    userInfo: {},
    hasLogin: wx.getStorageSync('loginFlag') ? true : false
  },
  /**
   * 检查本地storage中是否有skey登录标识态
   */
  checkLoginStatus: function () {
    let that = this
    let loginFlag = wx.getStorageSync('loginFlag')
    if (loginFlag) {
      // 检查session_key是否过期
      wx.checkSession({
        success: function () {
          that.getUserInfo()
        },
        fail: function () {
          that.setData({
            hasLogin: false
          })
        }
      })
    } else {
      that.setData({
        hasLogin: false
      })
    }
  },
  /**
   * 执行登录操作
   */
  doLogin: function () {
    let that = this
    wx.showLoading({
      title: '登录中...',
      mask: true
    })
    app.doLogin(that.getUserInfo)
  },
  goMyBooks: function () {
    wx.navigateTo({
      url: '../myBooks/myBooks'
    })
  },
  /**
   * 从全局globalData中获取用户信息
   */
  getUserInfo: function () {
    let that = this
    let userInfo = app.globalData.userInfo
    console.info('userInfo is:', userInfo)
    if (userInfo) {
      that.setData({
        hasLogin: true,
        userInfo,
      })
      wx.hideLoading()
    } else {
      console.log('globalData中userInfo为空')
    }
  },
  onLoad: function (options) {
    this.checkLoginStatus()
  },
  onShow: function () {
    let that = this
    that.setData({
      userInfo: app.globalData.userInfo
    })
  }
})