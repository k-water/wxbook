const app = getApp()
const api = require('../../config/config')

Page({
  data: {
    commentList: [],
    bookInfo: {},
    bookIsBuy: -1,
    commentLoading: true,
    downloading: false,
    downloadPercent: 0
  },

  goComment: function (ev) {
    let info = ev.currentTarget.dataset
    let navigateUrl = '../comment/comment?'

    for (let key in info) {
      info[key] = encodeURIComponent(info[key])
      navigateUrl += key + '=' + info[key] + '&'
    }

    navigateUrl = navigateUrl.substring(0, navigateUrl.length - 1)

    wx.navigateTo({
      url: navigateUrl,
      success: function (res) {
        // success
      },
      fail: function (err) {
        // fail
        throw (err)
      }
    })
  },
  readBook: function () {
    let that = this
    let fileUrl = that.data.bookInfo.file
    console.log(fileUrl)
    let key = 'book_' + that.data.bookInfo.id
    // 书籍是否已下载过
    let downloadPath = app.getDownloadPath(key)
    if (downloadPath) {
      app.openBook(downloadPath)
      return
    }

    const downloadTask = wx.downloadFile({
      url: fileUrl,
      success: function (res) {
        let filePath = res.tempFilePath
        console.log(filePath)
        that.setData({
          downloading: false
        })

        // 调用 wx.saveFile 将下载的文件保存在本地
        app.saveDownloadPath(key, filePath)
          .then(function (saveFilePath) {
            console.log(saveFilePath)
            app.openBook(saveFilePath)
          })
          .catch(function () {
            app.showInfo('文件保存失败')
          })

      },
      fail: function (error) {
        that.showInfo('文档下载失败')
        console.log(error)
      }
    })

    downloadTask.onProgressUpdate(function (res) {
      that.setData({
        downloading: true,
        downloadPercent: res.progress
      })
    })
  },

  confirmBuyBook: function () {
    let that = this
    wx.showModal({
      title: '提示',
      content: '确定用1积分兑换此书吗？',
      showCancel: true,
      cancelText: '打扰了',
      cancelColor: '#8a8a8a',
      confirmText: '确定',
      confirmColor: '#1AAD19',
      success: function (res) {
        if (res.confirm) {
          that.buyBook()
        } else if (res.cancel) {

        }
      }
    })
  },
  /**
   * 购买书籍
   */
  buyBook: function () {
    let that = this
    let bookId = that.data.bookInfo.id
    let requestData = {
      bookid: bookId,
      skey: app.getLoginFlag()
    }

    wx.request({
      url: api.buyBookUrl,
      data: requestData,
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function (res) {
        // success
        if (res.data.result === 0) {
          that.setData({
            bookIsBuy: 1
          })

          let balance = app.globalData.userInfo.balance
          app.globalData.userInfo.balance = balance - 1
          wx.setStorageSync('userInfo', JSON.stringify(app.globalData.userInfo))

          that.showInfo('购买成功', 'success')
        } else {
          console.log(res)
          that.showInfo('返回数据异常')
        }
      },
      fail: function (err) {
        // fail
        console.log(err)
        that.showInfo('请求失败')
      }
    })
  },

  /**
   * 获取书籍评论列表及是否购买
   */
  getPageData: function () {
    let that = this
    let requestData = {
      bookid: that.data.bookInfo.id,
      skey: app.getLoginFlag()
    }

    wx.request({
      url: api.queryBookUrl,
      data: requestData,
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function (res) {
        console.log(res)
        // success
        if (res.data.result === 0) {
          that.setData({
            commentList: res.data.data.lists || [],
            bookIsBuy: res.data.data.is_buy
          })

          setTimeout(() => {
            that.setData({
              commentLoading: false
            })
          }, 500)
        } else {
          that.showInfo('返回数据异常')
        }
      },
      fail: function (err) {
        // fail
        that.showInfo('返回数据异常')
        console.log(err)
      }
    })
  },

  showInfo: function (info, icon = 'none') {
    wx.showToast({
      title: info,
      icon: icon,
      duration: 1500,
      mask: true
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    let _bookInfo = {}
    let that = this
    for (let key in options) {
      _bookInfo[key] = decodeURIComponent(options[key])
    }

    that.setData({
      bookInfo: _bookInfo
    })

    that.getPageData()
  },

  // 从上级页面返回时 重新拉去评论列表
  backRefreshPage: function () {
    let that = this
    that.setData({
      commentLoading: true
    })

    that.getPageData()
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (wx.getStorageSync('isFromBack')) {
      wx.removeStorageSync('isFromBack')
      this.backRefreshPage()
    }
  }
})