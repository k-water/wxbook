const api = require('../../config/config')
const app = getApp()

Page({
  data: {
    bookInfo: {},
    comment: ''
  },
  inputComment: function (ev) {
    let that = this
    that.setData({
      comment: ev.detail.value
    })
  },
  checkEmpty: function (input) {
    return input === ''
  },
  checkIllegal: function (input) {
    let pattern = /[`#^<>:"?{}\/;'[\]]/im
    let _result = pattern.test(input)
    return _result
  },
  /*
   * 检测用户输入
   * 1. 是否包含非法字符
   * 2. 是否为空
   * 3. 是否超出长度限制
   */
  checkUserInput: function () {
    let that = this
    let comment = that.data.comment
    let showToastFlag = false
    let toastWording = ''

    if (that.checkEmpty(comment)) {
      showToastFlag = true
      toastWording = '输入不能为空'
    } else if (that.checkIllegal(comment)) {
      showToastFlag = true
      toastWording = '含有非法字符'
    } else if (comment.length > 140) {
      showToastFlag = true
      toastWording = '长度超出限制'
    }

    if (showToastFlag) {
      that.showInfo(toastWording)
      return false
    } else {
      return true
    }
  },
  submitComment: function (ev) {
    let that = this
    let formId = ev.detail.formId
    if (that.checkUserInput()) {
      console.log('submit!')

      let requestData = {
        skey: app.getLoginFlag(),
        content: that.data.comment,
        bookid: that.data.bookInfo.id,
        formid: formId
      }

      wx.request({
        url: api.commentUrl,
        data: requestData,
        method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        // header: {}, // 设置请求的 header
        success: function (res) {
          // success
          if (res.data.result === 0) {
            that.showInfo('评论成功', 'success', function () {
              wx.setStorageSync('isFormBack', '1')
              setTimeout(() => {
                wx.navigateBack({
                  delta: 1, // 回退前 delta(默认为1) 页面
                  success: function (res) {
                    // success
                  },
                  fail: function (err) {
                    // fail
                    throw (err)
                  }
                })
              }, 1500)
            })
          } else {
            console.log(res.data)
            that.showInfo(res.data.errmsg)
          }
        },
        fail: function () {
          // fail
          that.showInfo('请求失败')
        }
      })
    }
  },
  /**
   *  封装 wx.showToast
   */
  showInfo: function (info, icon = 'none', callback = () => {}) {
    wx.showToast({
      title: info,
      icon,
      duration: 1500,
      mask: true,
      success: callback
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _bookInfo = {}

    for (let key in options) {
      _bookInfo[key] = decodeURIComponent(options[key])
    }

    console.log(_bookInfo)

    this.setData({
      bookInfo: _bookInfo
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onRead: function () {
    console.log('current page is onReady')
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('current page is onShow')
  }
})