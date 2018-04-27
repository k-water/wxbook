const api = require('../../config/config')

// get app instance
const app = getApp()

Page({
  /**
   * Page init data
   */
  data: {
    bookList: [],
    indicatorDots: false,
    autoplay: false,
    interval: 3000,
    duration: 1000,
    circular: true, // 是否采用衔接滑动
    sideMargin: '150rpx',
    showLoading: true
  },

  /**
   * 书籍详情
   */
  goDetail: function(ev) {
    let info = ev.currentTarget.dataset
    console.log(info)
    let navigateUrl = '../detail/detail?'

    for (let key in info) {
      info[key] = encodeURIComponent(info[key])
      navigateUrl += key + '=' + info[key] + '&'
    }

    navigateUrl = navigateUrl.substring(0, navigateUrl.length - 1)

    wx.navigateTo({
      url: navigateUrl,
      success: function(res){
        // success
      },
      fail: function() {
        // fail
      }
    })
  },

  getBookList: function() {
    let that = this
    
    wx.request({
      url: api.getBooksUrl,
      data: {
        is_all: 1
      },
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function(res){
        // success
        let data = res.data
        if (data.result === 0) {
          // 为了展示loading
          setTimeout(function() {
            that.setData({
              bookList: data.data,
              showLoading: false
            })
          }, 800)
        }
      },
      fail: function(error) {
        // fail
        console.log(error)
      },
      complete: function() {
        // complete
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    that.getBookList()
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log('current page is onReady')
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('current page is onShow')
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      console.log(res.target)
    }
    return {
      title: '小书架首页', // 分享标题
      path: '/pages/books/books', // 分享路径
      imageUrl: '/images/bookstore.png',
      success: function (res) {
        console.log('转发成功')
      },
      fail: function (res) {
        console.log('转发失败')
      }
    }
  }
})