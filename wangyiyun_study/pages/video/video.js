// pages/video/video.js
import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList: [],//导航标签数据
    navId: '',//导航的标识
    videoList: [],//视频列表数据
    videoId: '',//视频id标识
    videoUpdateTime:[],//记录video播放的时长
    isTriggered:false//标识下拉刷新是否被触发
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 调用函数
    this.getVideoGroupListData();


  },
  //获取导航数据
  async getVideoGroupListData() {
    let videoGroupListData = await request('/video/group/list');
    this.setData({
      videoGroupList: videoGroupListData.data.slice(0, 14),
      navId: videoGroupListData.data[0].id
    })
    //获取视频列表数据
    this.getVideoList(this.data.navId)
  },
  //点击切换导航的问题
  changeNav(event) {
    let navId = event.currentTarget.id;//通过id向event对象传参的时如果传递的是number会自动转换成string
    this.setData({
      navId: navId * 1,
      videoList: []
    })
    //显示正在加载
    wx.showLoading({
      title: '正在加载'
    })
    //动态获取当前导航对应得视频数据
    this.getVideoList(this.data.navId);

  },
  //获取视频列表数据
  async getVideoList(navId) {
    let videoListData = await request("/video/group", { id: navId });
    //关闭消息提示框
    wx.hideLoading();
    //关闭下拉刷新
    
    let index = 0;
    let videoList = videoListData.datas.map(item => {
      item.id = index++;
      return item;
    })
    this.setData({
      videoList,
      //关闭下拉刷新
      isTriggered:false
    })

  },
  //点击播放/继续播放的回调
  handleplay(event) {
    /**需求：
     * 1.在点击播放的事件中找到上一个播放的视频
     * 2.在播放新的视频之前关闭上一个正在播放的视频
     * 关键：
     * 1.如何找到上一个视频的实例
     * 2.如何确认点击播放的视频和正在播放的视频不是同一个视频
     * 单例模式：
     * 1.需要创建多个对象的场景下，通过一个变量接收，始终保持只有一个对象
     * 2.节省内存空间
     */
    let vid = event.currentTarget.id;
    //关闭上一个视频
    //this.vid!==vid&&this.videoContext&&this.videoContext.stop();
    //this.vid=vid;
    //更新data中videoId的状态数据
    this.setData({
      videoId: vid
    })
    //创建控制video标签的实例对象
    this.videoContext = wx.createVideoContext(vid);
    //判断当前的视频之前是否有播放记录，如果有则跳转至指定位置
    let {videoUpdateTime}=this.data;
    let videoItem=videoUpdateTime.find(item=>item.vid===vid);
    if(videoItem){
      this.videoContext.seek(videoItem.currentTime);
    }
    this.videoContext.play();
  },
  //监听视频播放进度的回调
  handleTimeUpdate(event){
    //console.log(event);
    let videoTimeObj={vid:event.currentTarget.id,currentTime:event.detail.currentTime};
    let {videoUpdateTime}=this.data;
    /**
     * 思路
     * 判断记录播放时长的videoUpdataTime数组中是否有当前视频的播放记录
     * 1.如果有：在原有的播放记录中修改播放时间为当前的播放时间
     * 2.如果没有：需要在数组中添加当前视频的播放对象
     */
    let videoItem=videoUpdateTime.find(item=>item.vid===videoTimeObj.vid);
    if(videoItem){//为true则之前有
      videoItem.currentTime=event.detail.currentTime;
    }else{//之前没有
      videoUpdateTime.push(videoTimeObj);
    }
    
    this.setData({
      videoUpdateTime
    })
  },
  //视频播放结束自动调用
  handleEnded(event){
    //移除记录播放时长数组中当前视频对象
    let {videoUpdateTime}=this.data;
    videoUpdateTime.splice(videoUpdateTime.findIndex(item=>item.vid===event.currentTarget.id),1);
    this.setData({
      videoUpdateTime
    })
  },
  //自定义下拉刷新的回调，针对于scroll-view
  handleRefresher(){
    console.log('scroll-view 下拉刷新');
    //再次发送请求，获取最新的视频列表数据
    this.getVideoList(this.data.navId);
  },
  //自定义上拉触底的回调，针对于scroll-view
  handleToLower(){
    console.log("scroll-view 上拉触底");
    //数据分页：1后端分页，2.前端分页
    console.log('发送请求||在前端截取最新的数据 追加到视频列表的后方');
    console.log("网易云音乐暂时没有提供分页的api");
    //模拟数据
    //在线json格式化校验工具https://www.bejson.com/?src=xiaof
   let newVideoList=[
     {
    "type": 1,
    "displayed": false,
    "alg": "onlineHotGroup",
    "extAlg": null,
    "data": {
      "alg": "onlineHotGroup",
      "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
      "threadId": "R_VI_62_A5CA712B8AD35EB47746491003F92619",
      "coverUrl": "https://p2.music.126.net/_IhLCb7lqQRLMjdvXTNvxw==/109951163194825681.jpg",
      "height": 720,
      "width": 1280,
      "title": "上海1.17梦龙演唱会原版shots 超感动现场",
      "description": "imagine dragons 竟然唱了原版的shots，简直是太感人了==！！！",
      "commentCount": 166,
      "shareCount": 257,
      "resolutions": [{
        "resolution": 240,
        "size": 34906898
      }, {
        "resolution": 480,
        "size": 50009104
      }, {
        "resolution": 720,
        "size": 79898657
      }],
      "creator": {
        "defaultAvatar": false,
        "province": 310000,
        "authStatus": 0,
        "followed": false,
        "avatarUrl": "http://p1.music.126.net/G-SaIMxG1_2Mstb1-6qBWA==/109951163585856789.jpg",
        "accountStatus": 0,
        "gender": 0,
        "city": 310101,
        "birthday": 790185600000,
        "userId": 90845132,
        "userType": 0,
        "nickname": "咸翻翻",
        "signature": "废柴",
        "description": "",
        "detailDescription": "",
        "avatarImgId": 109951163585856780,
        "backgroundImgId": 109951163591750500,
        "backgroundUrl": "http://p1.music.126.net/4_IUSZMx6227fca3vZ7tdQ==/109951163591750498.jpg",
        "authority": 0,
        "mutual": false,
        "expertTags": null,
        "experts": null,
        "djStatus": 0,
        "vipType": 11,
        "remarkName": null,
        "avatarImgIdStr": "109951163585856789",
        "backgroundImgIdStr": "109951163591750498"
      },
      "urlInfo": {
        "id": "A5CA712B8AD35EB47746491003F92619",
        "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/7DopJmtc_1341207771_shd.mp4?ts=1626508314&rid=3009063014E119FC636C42FBC02D0085&rl=3&rs=sJhLvKUTLvZKnkEudMSIKBOitRxTnraw&sign=630d1356adce4ac37d13e7de70ac7fcc&ext=f0xw0mOJqGcf8yfMQn4khLo0vOAZ2Oret6FDS9VvANJChLlaNY31iFaOKLsBLFizcC9LAKrt1EayBUpZs8oKU62skYTL9jsdoMYU3jHvoYfevsxc4Be2xmN%2BuLAh1DyKVb9LnwDAb3v3hbBR9qwcunK%2Ba3HJSp1%2BcfILebGI%2FXxKEhuK%2Bl%2BI8wzqAAzYC8LPY6qrU2WHYbOUhrggo4n%2FLk3a%2FVhdrm2jDrwI38C%2FG%2BkV7GW6iPFQBPvkPIaLEw3Z",
        "size": 79898657,
        "validityTime": 1200,
        "needPay": false,
        "payInfo": null,
        "r": 720
      },
      "videoGroup": [{
        "id": 58100,
        "name": "现场",
        "alg": null
      }, {
        "id": 9102,
        "name": "演唱会",
        "alg": null
      }, {
        "id": 57106,
        "name": "欧美现场",
        "alg": null
      }, {
        "id": 57110,
        "name": "饭拍现场",
        "alg": null
      }, {
        "id": 1100,
        "name": "音乐现场",
        "alg": null
      }, {
        "id": 5100,
        "name": "音乐",
        "alg": null
      }, {
        "id": 13164,
        "name": "快乐",
        "alg": null
      }],
      "previewUrl": null,
      "previewDurationms": 0,
      "hasRelatedGameAd": false,
      "markTypes": null,
      "relateSong": [{
        "name": "Shots",
        "id": 30373640,
        "pst": 0,
        "t": 0,
        "ar": [{
          "id": 94779,
          "name": "Imagine Dragons",
          "tns": [],
          "alias": []
        }],
        "alia": [],
        "pop": 100,
        "st": 0,
        "rt": null,
        "fee": 1,
        "v": 29,
        "crbt": null,
        "cf": "",
        "al": {
          "id": 3098384,
          "name": "Shots",
          "picUrl": "http://p3.music.126.net/meqisONuzYw9ClJgmnJ0OQ==/7888995929406149.jpg",
          "tns": [],
          "pic": 7888995929406149
        },
        "dt": 232333,
        "h": {
          "br": 320000,
          "fid": 0,
          "size": 9296501,
          "vd": -53806
        },
        "m": {
          "br": 192000,
          "fid": 0,
          "size": 5577918,
          "vd": -51228
        },
        "l": {
          "br": 128000,
          "fid": 0,
          "size": 3718626,
          "vd": -49681
        },
        "a": null,
        "cd": "1",
        "no": 1,
        "rtUrl": null,
        "ftype": 0,
        "rtUrls": [],
        "djId": 0,
        "copyright": 2,
        "s_id": 0,
        "rtype": 0,
        "rurl": null,
        "mst": 9,
        "cp": 7003,
        "mv": 384613,
        "publishTime": 1422288000007,
        "privilege": {
          "id": 30373640,
          "fee": 1,
          "payed": 0,
          "st": 0,
          "pl": 0,
          "dl": 0,
          "sp": 0,
          "cp": 0,
          "subp": 0,
          "cs": false,
          "maxbr": 999000,
          "fl": 0,
          "toast": false,
          "flag": 4,
          "preSell": false
        }
      }, {
        "name": "Shots (Broiler Remix)",
        "id": 31789010,
        "pst": 0,
        "t": 0,
        "ar": [{
          "id": 94779,
          "name": "Imagine Dragons",
          "tns": [],
          "alias": []
        }, {
          "id": 886022,
          "name": "Broiler",
          "tns": [],
          "alias": []
        }],
        "alia": [],
        "pop": 100,
        "st": 0,
        "rt": null,
        "fee": 1,
        "v": 40,
        "crbt": null,
        "cf": "",
        "al": {
          "id": 3138008,
          "name": "Shots",
          "picUrl": "http://p3.music.126.net/_WUjq86Db9pfhpwaYeoLqQ==/109951163219130849.jpg",
          "tns": [],
          "pic_str": "109951163219130849",
          "pic": 109951163219130850
        },
        "dt": 191000,
        "h": {
          "br": 320000,
          "fid": 0,
          "size": 7665616,
          "vd": -17000
        },
        "m": {
          "br": 192000,
          "fid": 0,
          "size": 4599467,
          "vd": -14500
        },
        "l": {
          "br": 128000,
          "fid": 0,
          "size": 3066393,
          "vd": -13099
        },
        "a": null,
        "cd": "1",
        "no": 1,
        "rtUrl": null,
        "ftype": 0,
        "rtUrls": [],
        "djId": 0,
        "copyright": 0,
        "s_id": 0,
        "rtype": 0,
        "rurl": null,
        "mst": 9,
        "cp": 7003,
        "mv": 419807,
        "publishTime": 1430668800007,
        "privilege": {
          "id": 31789010,
          "fee": 1,
          "payed": 0,
          "st": 0,
          "pl": 0,
          "dl": 0,
          "sp": 0,
          "cp": 0,
          "subp": 0,
          "cs": false,
          "maxbr": 320000,
          "fl": 0,
          "toast": false,
          "flag": 4,
          "preSell": false
        }
      }, {
        "name": "Shots (Broiler Remix)",
        "id": 31311695,
        "pst": 0,
        "t": 0,
        "ar": [{
          "id": 94779,
          "name": "Imagine Dragons",
          "tns": [],
          "alias": []
        }, {
          "id": 886022,
          "name": "Broiler",
          "tns": [],
          "alias": []
        }],
        "alia": [],
        "pop": 100,
        "st": 0,
        "rt": null,
        "fee": 8,
        "v": 27,
        "crbt": null,
        "cf": "",
        "al": {
          "id": 3117171,
          "name": "Shots (Broiler Remix)",
          "picUrl": "http://p4.music.126.net/pCggmlokub94Lxop1a3KOQ==/2942293116060555.jpg",
          "tns": [],
          "pic": 2942293116060555
        },
        "dt": 190000,
        "h": {
          "br": 320000,
          "fid": 0,
          "size": 7603765,
          "vd": -8700
        },
        "m": {
          "br": 192000,
          "fid": 0,
          "size": 4562276,
          "vd": -6000
        },
        "l": {
          "br": 128000,
          "fid": 0,
          "size": 3041532,
          "vd": -4500
        },
        "a": null,
        "cd": "1",
        "no": 1,
        "rtUrl": null,
        "ftype": 0,
        "rtUrls": [],
        "djId": 0,
        "copyright": 0,
        "s_id": 0,
        "rtype": 0,
        "rurl": null,
        "mst": 9,
        "cp": 7003,
        "mv": 419807,
        "publishTime": 1427385600007,
        "privilege": {
          "id": 31311695,
          "fee": 8,
          "payed": 0,
          "st": 0,
          "pl": 128000,
          "dl": 0,
          "sp": 7,
          "cp": 1,
          "subp": 1,
          "cs": false,
          "maxbr": 320000,
          "fl": 128000,
          "toast": false,
          "flag": 4,
          "preSell": false
        }
      }],
      "relatedInfo": null,
      "videoUserLiveInfo": null,
      "vid": "A5CA712B8AD35EB47746491003F92619",
      "durationms": 306283,
      "playTime": 186962,
      "praisedCount": 1432,
      "praised": false,
      "subscribed": false
    }
  }, {
    "type": 1,
    "displayed": false,
    "alg": "onlineHotGroup",
    "extAlg": null,
    "data": {
      "alg": "onlineHotGroup",
      "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
      "threadId": "R_VI_62_B69B1EC3D5EF3BF17B071FEFBE7FB104",
      "coverUrl": "https://p2.music.126.net/pMeOs3U-y4U2uy-z5TOjJg==/109951164222279132.jpg",
      "height": 720,
      "width": 1280,
      "title": "感受一下BLACKPINK的真实唱功，真的是稳如老狗！",
      "description": "感受一下BLACKPINK的真实唱功，真的是稳如老狗！#BLACKPINK#\r\n",
      "commentCount": 2531,
      "shareCount": 3570,
      "resolutions": [{
        "resolution": 240,
        "size": 13550013
      }, {
        "resolution": 480,
        "size": 21671162
      }, {
        "resolution": 720,
        "size": 30939509
      }],
      "creator": {
        "defaultAvatar": false,
        "province": 340000,
        "authStatus": 0,
        "followed": false,
        "avatarUrl": "http://p1.music.126.net/ZCCbWp4xSTHRR0Ef8TlBHg==/109951166174859116.jpg",
        "accountStatus": 0,
        "gender": 1,
        "city": 340800,
        "birthday": 888768000000,
        "userId": 75868816,
        "userType": 200,
        "nickname": "MusicalTimes",
        "signature": "音乐博主 音乐视频自媒体",
        "description": "",
        "detailDescription": "",
        "avatarImgId": 109951166174859120,
        "backgroundImgId": 109951164371288290,
        "backgroundUrl": "http://p1.music.126.net/6MI9fLPPC-V7HjwRqMVOCg==/109951164371288283.jpg",
        "authority": 0,
        "mutual": false,
        "expertTags": ["欧美"],
        "experts": {
          "1": "音乐视频达人",
          "2": "欧美音乐资讯达人"
        },
        "djStatus": 10,
        "vipType": 11,
        "remarkName": null,
        "avatarImgIdStr": "109951166174859116",
        "backgroundImgIdStr": "109951164371288283"
      },
      "urlInfo": {
        "id": "B69B1EC3D5EF3BF17B071FEFBE7FB104",
        "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/90g0oAVH_2540614210_shd.mp4?ts=1626508314&rid=3009063014E119FC636C42FBC02D0085&rl=3&rs=FJtiPrQRomvMSFMhkWUuuOZGSRLePnIF&sign=da80e3ada0021900710e35f7eabfc06d&ext=f0xw0mOJqGcf8yfMQn4khLo0vOAZ2Oret6FDS9VvANJChLlaNY31iFaOKLsBLFizcC9LAKrt1EayBUpZs8oKU62skYTL9jsdoMYU3jHvoYfevsxc4Be2xmN%2BuLAh1DyKVb9LnwDAb3v3hbBR9qwcunK%2Ba3HJSp1%2BcfILebGI%2FXxKEhuK%2Bl%2BI8wzqAAzYC8LPY6qrU2WHYbOUhrggo4n%2FLk3a%2FVhdrm2jDrwI38C%2FG%2BkV7GW6iPFQBPvkPIaLEw3Z",
        "size": 30939509,
        "validityTime": 1200,
        "needPay": false,
        "payInfo": null,
        "r": 720
      },
      "videoGroup": [{
        "id": 58100,
        "name": "现场",
        "alg": null
      }, {
        "id": 1101,
        "name": "舞蹈",
        "alg": null
      }, {
        "id": 57107,
        "name": "韩语现场",
        "alg": null
      }, {
        "id": 57108,
        "name": "流行现场",
        "alg": null
      }, {
        "id": 12100,
        "name": "流行",
        "alg": null
      }, {
        "id": 5100,
        "name": "音乐",
        "alg": null
      }, {
        "id": 14146,
        "name": "兴奋",
        "alg": null
      }, {
        "id": 92105,
        "name": "BLACKPINK",
        "alg": null
      }, {
        "id": 23116,
        "name": "音乐推荐",
        "alg": null
      }],
      "previewUrl": null,
      "previewDurationms": 0,
      "hasRelatedGameAd": false,
      "markTypes": null,
      "relateSong": [{
        "name": "AS IF IT’S YOUR LAST",
        "id": 1325898352,
        "pst": 0,
        "t": 0,
        "ar": [{
          "id": 12068017,
          "name": "BLACKPINK",
          "tns": [],
          "alias": []
        }],
        "alia": [],
        "pop": 100,
        "st": 0,
        "rt": null,
        "fee": 8,
        "v": 6,
        "crbt": null,
        "cf": "",
        "al": {
          "id": 74266151,
          "name": "BLACKPINK IN YOUR AREA",
          "picUrl": "http://p4.music.126.net/yKysEblB7-HOVrUCjvRhqw==/109951163678530141.jpg",
          "tns": [],
          "pic_str": "109951163678530141",
          "pic": 109951163678530140
        },
        "dt": 212266,
        "h": {
          "br": 320000,
          "fid": 0,
          "size": 8492974,
          "vd": -44500
        },
        "m": {
          "br": 192000,
          "fid": 0,
          "size": 5095802,
          "vd": -41900
        },
        "l": {
          "br": 128000,
          "fid": 0,
          "size": 3397216,
          "vd": -40200
        },
        "a": null,
        "cd": "1",
        "no": 5,
        "rtUrl": null,
        "ftype": 0,
        "rtUrls": [],
        "djId": 0,
        "copyright": 0,
        "s_id": 0,
        "rtype": 0,
        "rurl": null,
        "mst": 9,
        "cp": 457010,
        "mv": 0,
        "publishTime": 1542902400000,
        "privilege": {
          "id": 1325898352,
          "fee": 8,
          "payed": 0,
          "st": 0,
          "pl": 128000,
          "dl": 0,
          "sp": 7,
          "cp": 1,
          "subp": 1,
          "cs": false,
          "maxbr": 999000,
          "fl": 128000,
          "toast": false,
          "flag": 69,
          "preSell": false
        }
      }],
      "relatedInfo": null,
      "videoUserLiveInfo": null,
      "vid": "B69B1EC3D5EF3BF17B071FEFBE7FB104",
      "durationms": 216619,
      "playTime": 5377684,
      "praisedCount": 52548,
      "praised": false,
      "subscribed": false
    }
  }, {
    "type": 1,
    "displayed": false,
    "alg": "onlineHotGroup",
    "extAlg": null,
    "data": {
      "alg": "onlineHotGroup",
      "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
      "threadId": "R_VI_62_4A0DDAB1D2D4D4F575DC427796CFA3EB",
      "coverUrl": "https://p2.music.126.net/v2ULLtPQknqCmvO9oJ26Zw==/109951163205119318.jpg",
      "height": 360,
      "width": 640,
      "title": "小伙参加“好声音”说唱阿姆《Lose Yourself》，导师齐转身！",
      "description": "#Eminem#小伙参加“好声音”说唱阿姆《Lose Yourself》，导师齐转身！",
      "commentCount": 202,
      "shareCount": 197,
      "resolutions": [{
        "resolution": 240,
        "size": 17891111
      }],
      "creator": {
        "defaultAvatar": false,
        "province": 110000,
        "authStatus": 0,
        "followed": false,
        "avatarUrl": "http://p1.music.126.net/5CY25umiiQXekDIHxANYoQ==/19047939439947549.jpg",
        "accountStatus": 0,
        "gender": 2,
        "city": 110101,
        "birthday": 852048000000,
        "userId": 338522780,
        "userType": 0,
        "nickname": "翻唱红人",
        "signature": "全网最火翻唱歌曲大搜罗，只发高清版！",
        "description": "",
        "detailDescription": "",
        "avatarImgId": 19047939439947548,
        "backgroundImgId": 2002210674180200,
        "backgroundUrl": "http://p1.music.126.net/45Nu4EqvFqK_kQj6BkPwcw==/2002210674180200.jpg",
        "authority": 0,
        "mutual": false,
        "expertTags": null,
        "experts": {
          "1": "音乐视频达人"
        },
        "djStatus": 0,
        "vipType": 0,
        "remarkName": null,
        "avatarImgIdStr": "19047939439947549",
        "backgroundImgIdStr": "2002210674180200"
      },
      "urlInfo": {
        "id": "4A0DDAB1D2D4D4F575DC427796CFA3EB",
        "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/v35iBdas_73485160_sd.mp4?ts=1626508314&rid=3009063014E119FC636C42FBC02D0085&rl=3&rs=ALmVFVrkzjkOCItTWyRYvNIiTMVhksrI&sign=b7ba31b9bc568c0f2385f2c947d0fc1e&ext=f0xw0mOJqGcf8yfMQn4khLo0vOAZ2Oret6FDS9VvANJChLlaNY31iFaOKLsBLFizcC9LAKrt1EayBUpZs8oKU62skYTL9jsdoMYU3jHvoYfevsxc4Be2xmN%2BuLAh1DyKVb9LnwDAb3v3hbBR9qwcunK%2Ba3HJSp1%2BcfILebGI%2FXxKEhuK%2Bl%2BI8wzqAAzYC8LPY6qrU2WHYbOUhrggo4n%2FLk3a%2FVhdrm2jDrwI38C%2FG%2BkV7GW6iPFQBPvkPIaLEw3Z",
        "size": 17891111,
        "validityTime": 1200,
        "needPay": false,
        "payInfo": null,
        "r": 240
      },
      "videoGroup": [{
        "id": 58100,
        "name": "现场",
        "alg": null
      }, {
        "id": 60100,
        "name": "翻唱",
        "alg": null
      }, {
        "id": 58109,
        "name": "国外达人",
        "alg": null
      }, {
        "id": 4107,
        "name": "说唱",
        "alg": null
      }, {
        "id": 5100,
        "name": "音乐",
        "alg": null
      }, {
        "id": 4101,
        "name": "娱乐",
        "alg": null
      }, {
        "id": 3101,
        "name": "综艺",
        "alg": null
      }, {
        "id": 16131,
        "name": "英文",
        "alg": null
      }, {
        "id": 15198,
        "name": "Eminem",
        "alg": null
      }],
      "previewUrl": null,
      "previewDurationms": 0,
      "hasRelatedGameAd": false,
      "markTypes": [109],
      "relateSong": [{
        "name": "Lose Yourself",
        "id": 5052317,
        "pst": 0,
        "t": 0,
        "ar": [{
          "id": 32665,
          "name": "Eminem",
          "tns": [],
          "alias": []
        }],
        "alia": [],
        "pop": 100,
        "st": 0,
        "rt": "",
        "fee": 8,
        "v": 50,
        "crbt": null,
        "cf": "",
        "al": {
          "id": 501243,
          "name": "8 Mile",
          "picUrl": "http://p3.music.126.net/cdEfys0mWiyV4Ywp5GW9Tw==/6656443395492431.jpg",
          "tns": [],
          "pic": 6656443395492431
        },
        "dt": 320293,
        "h": {
          "br": 320000,
          "fid": 0,
          "size": 12814672,
          "vd": -30900
        },
        "m": {
          "br": 192000,
          "fid": 0,
          "size": 7688821,
          "vd": -28200
        },
        "l": {
          "br": 128000,
          "fid": 0,
          "size": 5125895,
          "vd": -26800
        },
        "a": null,
        "cd": "1",
        "no": 1,
        "rtUrl": null,
        "ftype": 0,
        "rtUrls": [],
        "djId": 0,
        "copyright": 1,
        "s_id": 0,
        "rtype": 0,
        "rurl": null,
        "mst": 9,
        "cp": 7003,
        "mv": 37477,
        "publishTime": 1033401600007,
        "privilege": {
          "id": 5052317,
          "fee": 8,
          "payed": 0,
          "st": 0,
          "pl": 128000,
          "dl": 0,
          "sp": 7,
          "cp": 1,
          "subp": 1,
          "cs": false,
          "maxbr": 999000,
          "fl": 128000,
          "toast": false,
          "flag": 4,
          "preSell": false
        }
      }],
      "relatedInfo": null,
      "videoUserLiveInfo": null,
      "vid": "4A0DDAB1D2D4D4F575DC427796CFA3EB",
      "durationms": 152137,
      "playTime": 309247,
      "praisedCount": 1668,
      "praised": false,
      "subscribed": false
    }
  }, {
    "type": 1,
    "displayed": false,
    "alg": "onlineHotGroup",
    "extAlg": null,
    "data": {
      "alg": "onlineHotGroup",
      "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
      "threadId": "R_VI_62_A4844648DF88A401CF2CCE1EB57D12BA",
      "coverUrl": "https://p2.music.126.net/-_Bn6eMkSCH5jKCYWcO2cQ==/109951163573372697.jpg",
      "height": 720,
      "width": 1280,
      "title": "陈奕迅《夜空中最亮的星》Another eason's life",
      "description": null,
      "commentCount": 326,
      "shareCount": 1132,
      "resolutions": [{
        "resolution": 240,
        "size": 23769779
      }, {
        "resolution": 480,
        "size": 48487630
      }, {
        "resolution": 720,
        "size": 121605615
      }],
      "creator": {
        "defaultAvatar": false,
        "province": 1000000,
        "authStatus": 0,
        "followed": false,
        "avatarUrl": "http://p1.music.126.net/asGs3TDKEwpg6QmYzDzmQg==/109951163036684890.jpg",
        "accountStatus": 0,
        "gender": 2,
        "city": 1001700,
        "birthday": -2209017600000,
        "userId": 332760933,
        "userType": 0,
        "nickname": "flora4fun",
        "signature": "",
        "description": "",
        "detailDescription": "",
        "avatarImgId": 109951163036684900,
        "backgroundImgId": 109951163152129490,
        "backgroundUrl": "http://p1.music.126.net/tVykaNYHgi6UynQHRKkmFA==/109951163152129491.jpg",
        "authority": 0,
        "mutual": false,
        "expertTags": null,
        "experts": null,
        "djStatus": 0,
        "vipType": 11,
        "remarkName": null,
        "avatarImgIdStr": "109951163036684890",
        "backgroundImgIdStr": "109951163152129491"
      },
      "urlInfo": {
        "id": "A4844648DF88A401CF2CCE1EB57D12BA",
        "url": "http://vodkgeyttp9.vod.126.net/cloudmusic/0ix3CAYq_1520854607_shd.mp4?ts=1626508314&rid=3009063014E119FC636C42FBC02D0085&rl=3&rs=cCzmRtSiQqWyHSXEcOPdmRMoYxsArTyW&sign=a4c169ca89200b29ef75323c57884b33&ext=f0xw0mOJqGcf8yfMQn4khLo0vOAZ2Oret6FDS9VvANJChLlaNY31iFaOKLsBLFizcC9LAKrt1EayBUpZs8oKU62skYTL9jsdoMYU3jHvoYfevsxc4Be2xmN%2BuLAh1DyKVb9LnwDAb3v3hbBR9qwcunK%2Ba3HJSp1%2BcfILebGI%2FXxKEhuK%2Bl%2BI8wzqAAzYC8LPY6qrU2WHYbOUhrggo4n%2FLk3a%2FVhdrm2jDrwI38C%2FG%2BlEMTn%2Fn6y01vqONnzt0wZI",
        "size": 121605615,
        "validityTime": 1200,
        "needPay": false,
        "payInfo": null,
        "r": 720
      },
      "videoGroup": [{
        "id": 58100,
        "name": "现场",
        "alg": null
      }, {
        "id": 59101,
        "name": "华语现场",
        "alg": null
      }, {
        "id": 57110,
        "name": "饭拍现场",
        "alg": null
      }, {
        "id": 1100,
        "name": "音乐现场",
        "alg": null
      }, {
        "id": 5100,
        "name": "音乐",
        "alg": null
      }, {
        "id": 23134,
        "name": "陈奕迅",
        "alg": null
      }],
      "previewUrl": null,
      "previewDurationms": 0,
      "hasRelatedGameAd": false,
      "markTypes": null,
      "relateSong": [{
        "name": "夜空中最亮的星",
        "id": 25706282,
        "pst": 0,
        "t": 0,
        "ar": [{
          "id": 12977,
          "name": "逃跑计划",
          "tns": [],
          "alias": []
        }],
        "alia": [],
        "pop": 100,
        "st": 0,
        "rt": "600902000009535440",
        "fee": 8,
        "v": 125,
        "crbt": null,
        "cf": "",
        "al": {
          "id": 2285010,
          "name": "世界",
          "picUrl": "http://p4.music.126.net/Eef2K2KV9dT3XUA6_Ve-Rw==/109951165543196748.jpg",
          "tns": [],
          "pic_str": "109951165543196748",
          "pic": 109951165543196750
        },
        "dt": 252000,
        "h": {
          "br": 320000,
          "fid": 0,
          "size": 10091667,
          "vd": -3700
        },
        "m": {
          "br": 192000,
          "fid": 0,
          "size": 6055017,
          "vd": -1200
        },
        "l": {
          "br": 128000,
          "fid": 0,
          "size": 4036692,
          "vd": -2
        },
        "a": null,
        "cd": "1",
        "no": 7,
        "rtUrl": null,
        "ftype": 0,
        "rtUrls": [],
        "djId": 0,
        "copyright": 1,
        "s_id": 0,
        "rtype": 0,
        "rurl": null,
        "mst": 9,
        "cp": 22036,
        "mv": 382555,
        "publishTime": 1325347200007,
        "privilege": {
          "id": 25706282,
          "fee": 8,
          "payed": 0,
          "st": 0,
          "pl": 128000,
          "dl": 0,
          "sp": 7,
          "cp": 1,
          "subp": 1,
          "cs": false,
          "maxbr": 999000,
          "fl": 128000,
          "toast": false,
          "flag": 4,
          "preSell": false
        }
      }],
      "relatedInfo": null,
      "videoUserLiveInfo": null,
      "vid": "A4844648DF88A401CF2CCE1EB57D12BA",
      "durationms": 246000,
      "playTime": 702896,
      "praisedCount": 3456,
      "praised": false,
      "subscribed": false
    }
  }, {
    "type": 1,
    "displayed": false,
    "alg": "onlineHotGroup",
    "extAlg": null,
    "data": {
      "alg": "onlineHotGroup",
      "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
      "threadId": "R_VI_62_3710D868A43C51CBEC49DB19A1EEA3EE",
      "coverUrl": "https://p2.music.126.net/74z9cnZ5g0_IN6HmnJMxsQ==/109951164017563301.jpg",
      "height": 1080,
      "width": 1920,
      "title": "杨迪神模仿张艺兴，激情热舞《sheep》，逗乐众人",
      "description": "杨迪神模仿张艺兴，激情热舞《sheep》，逗乐众人",
      "commentCount": 152,
      "shareCount": 427,
      "resolutions": [{
        "resolution": 240,
        "size": 50844531
      }, {
        "resolution": 480,
        "size": 78560360
      }, {
        "resolution": 720,
        "size": 118742957
      }, {
        "resolution": 1080,
        "size": 135792291
      }],
      "creator": {
        "defaultAvatar": false,
        "province": 410000,
        "authStatus": 0,
        "followed": false,
        "avatarUrl": "http://p1.music.126.net/SUeqMM8HOIpHv9Nhl9qt9w==/109951165647004069.jpg",
        "accountStatus": 0,
        "gender": 1,
        "city": 411300,
        "birthday": -2209017600000,
        "userId": 1458050424,
        "userType": 0,
        "nickname": "枫叶聊音乐",
        "signature": "",
        "description": "",
        "detailDescription": "",
        "avatarImgId": 109951165647004060,
        "backgroundImgId": 109951162868126480,
        "backgroundUrl": "http://p1.music.126.net/_f8R60U9mZ42sSNvdPn2sQ==/109951162868126486.jpg",
        "authority": 0,
        "mutual": false,
        "expertTags": null,
        "experts": null,
        "djStatus": 0,
        "vipType": 0,
        "remarkName": null,
        "avatarImgIdStr": "109951165647004069",
        "backgroundImgIdStr": "109951162868126486"
      },
      "urlInfo": {
        "id": "3710D868A43C51CBEC49DB19A1EEA3EE",
        "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/CFDoD90m_2456895736_uhd.mp4?ts=1626508314&rid=3009063014E119FC636C42FBC02D0085&rl=3&rs=gmFsUlABNJkMvBGRHiDKBKAwiqbwihjP&sign=882f7783f22c07f669bd97cadb5650ad&ext=f0xw0mOJqGcf8yfMQn4khLo0vOAZ2Oret6FDS9VvANJChLlaNY31iFaOKLsBLFizcC9LAKrt1EayBUpZs8oKU62skYTL9jsdoMYU3jHvoYfevsxc4Be2xmN%2BuLAh1DyKVb9LnwDAb3v3hbBR9qwcunK%2Ba3HJSp1%2BcfILebGI%2FXxKEhuK%2Bl%2BI8wzqAAzYC8LPY6qrU2WHYbOUhrggo4n%2FLk3a%2FVhdrm2jDrwI38C%2FG%2BkV7GW6iPFQBPvkPIaLEw3Z",
        "size": 135792291,
        "validityTime": 1200,
        "needPay": false,
        "payInfo": null,
        "r": 1080
      },
      "videoGroup": [{
        "id": 58100,
        "name": "现场",
        "alg": null
      }, {
        "id": 1100,
        "name": "音乐现场",
        "alg": null
      }, {
        "id": 5100,
        "name": "音乐",
        "alg": null
      }, {
        "id": 4101,
        "name": "娱乐",
        "alg": null
      }, {
        "id": 3101,
        "name": "综艺",
        "alg": null
      }, {
        "id": 76108,
        "name": "综艺片段",
        "alg": null
      }, {
        "id": 77102,
        "name": "内地综艺",
        "alg": null
      }],
      "previewUrl": null,
      "previewDurationms": 0,
      "hasRelatedGameAd": false,
      "markTypes": null,
      "relateSong": [],
      "relatedInfo": null,
      "videoUserLiveInfo": null,
      "vid": "3710D868A43C51CBEC49DB19A1EEA3EE",
      "durationms": 183530,
      "playTime": 592374,
      "praisedCount": 3561,
      "praised": false,
      "subscribed": false
    }
  }, {
    "type": 1,
    "displayed": false,
    "alg": "onlineHotGroup",
    "extAlg": null,
    "data": {
      "alg": "onlineHotGroup",
      "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
      "threadId": "R_VI_62_6B8FCEA405BBDEE583E033F3A159D1AA",
      "coverUrl": "https://p2.music.126.net/A4bwe6l0lYP5wMhqfFZT5A==/109951164594234613.jpg",
      "height": 1080,
      "width": 1920,
      "title": "这首歌《Never Say Goodbye》曾经火遍大街小巷，飞车必备单曲！",
      "description": "第一首：Never Say Goodbye - Mario / 朴素彬 / 송보람\r\n第二首：총 맞은 것처럼（像中枪一样） - 白智英\r\n第三首：Insomnia (불면증) - 辉星\r\n第四首：애원（entreaty） - 高耀太\r\n第五首；좋은 날（好日子）- IU\r\n素材来源于网络。",
      "commentCount": 100,
      "shareCount": 80,
      "resolutions": [{
        "resolution": 240,
        "size": 39200949
      }, {
        "resolution": 480,
        "size": 63777150
      }, {
        "resolution": 720,
        "size": 94725976
      }, {
        "resolution": 1080,
        "size": 115094155
      }],
      "creator": {
        "defaultAvatar": false,
        "province": 510000,
        "authStatus": 0,
        "followed": false,
        "avatarUrl": "http://p1.music.126.net/HT0x6IInv-swsNJi2w4Hwg==/109951163679891276.jpg",
        "accountStatus": 0,
        "gender": 0,
        "city": 510100,
        "birthday": 819820800000,
        "userId": 275326625,
        "userType": 204,
        "nickname": "蚕豆音乐娘",
        "signature": "有些人说不清哪里好，但就是谁都替代不了。",
        "description": "",
        "detailDescription": "",
        "avatarImgId": 109951163679891280,
        "backgroundImgId": 109951163258649380,
        "backgroundUrl": "http://p1.music.126.net/oVaU9BQpL6nYlS4Use5mag==/109951163258649378.jpg",
        "authority": 0,
        "mutual": false,
        "expertTags": null,
        "experts": {
          "1": "音乐原创视频达人"
        },
        "djStatus": 0,
        "vipType": 11,
        "remarkName": null,
        "avatarImgIdStr": "109951163679891276",
        "backgroundImgIdStr": "109951163258649378"
      },
      "urlInfo": {
        "id": "6B8FCEA405BBDEE583E033F3A159D1AA",
        "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/T5V3g3cr_2862090219_uhd.mp4?ts=1626508314&rid=3009063014E119FC636C42FBC02D0085&rl=3&rs=ajCKTtyJnhiimAxgjzsmcgQNUodkobuv&sign=64638ee01f76097614074b629656465b&ext=f0xw0mOJqGcf8yfMQn4khLo0vOAZ2Oret6FDS9VvANJChLlaNY31iFaOKLsBLFizcC9LAKrt1EayBUpZs8oKU62skYTL9jsdoMYU3jHvoYfevsxc4Be2xmN%2BuLAh1DyKVb9LnwDAb3v3hbBR9qwcunK%2Ba3HJSp1%2BcfILebGI%2FXxKEhuK%2Bl%2BI8wzqAAzYC8LPY6qrU2WHYbOUhrggo4n%2FLk3a%2FVhdrm2jDrwI38C%2FG%2BkV7GW6iPFQBPvkPIaLEw3Z",
        "size": 115094155,
        "validityTime": 1200,
        "needPay": false,
        "payInfo": null,
        "r": 1080
      },
      "videoGroup": [{
        "id": 58100,
        "name": "现场",
        "alg": null
      }, {
        "id": 1100,
        "name": "音乐现场",
        "alg": null
      }, {
        "id": 5100,
        "name": "音乐",
        "alg": null
      }],
      "previewUrl": null,
      "previewDurationms": 0,
      "hasRelatedGameAd": false,
      "markTypes": null,
      "relateSong": [],
      "relatedInfo": null,
      "videoUserLiveInfo": null,
      "vid": "6B8FCEA405BBDEE583E033F3A159D1AA",
      "durationms": 254016,
      "playTime": 429252,
      "praisedCount": 1438,
      "praised": false,
      "subscribed": false
    }
  }, {
    "type": 1,
    "displayed": false,
    "alg": "onlineHotGroup",
    "extAlg": null,
    "data": {
      "alg": "onlineHotGroup",
      "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
      "threadId": "R_VI_62_52CEC668254FF5380B51390998424187",
      "coverUrl": "https://p2.music.126.net/eIuR6pnAqdpL6UXVz4l0iA==/109951163573402083.jpg",
      "height": 360,
      "width": 640,
      "title": "蔡依林当年真的好拼 连商演都这么努力",
      "description": "蔡依林当年真的好拼 连商演都这么努力",
      "commentCount": 137,
      "shareCount": 113,
      "resolutions": [{
        "resolution": 240,
        "size": 15378466
      }],
      "creator": {
        "defaultAvatar": false,
        "province": 310000,
        "authStatus": 1,
        "followed": false,
        "avatarUrl": "http://p1.music.126.net/hWRfsshaHNSDOnCA_6oqnA==/109951163691568976.jpg",
        "accountStatus": 0,
        "gender": 1,
        "city": 310101,
        "birthday": 716486400000,
        "userId": 120529958,
        "userType": 10,
        "nickname": "蔡依林官方粉丝团",
        "signature": "依林在线官方粉丝团",
        "description": "依林在线官方粉丝团",
        "detailDescription": "依林在线官方粉丝团",
        "avatarImgId": 109951163691568980,
        "backgroundImgId": 109951165437005280,
        "backgroundUrl": "http://p1.music.126.net/rJmAt2BOe4lAZXb_NQe3bA==/109951165437005278.jpg",
        "authority": 0,
        "mutual": false,
        "expertTags": null,
        "experts": {
          "1": "音乐视频达人"
        },
        "djStatus": 0,
        "vipType": 0,
        "remarkName": null,
        "avatarImgIdStr": "109951163691568976",
        "backgroundImgIdStr": "109951165437005278"
      },
      "urlInfo": {
        "id": "52CEC668254FF5380B51390998424187",
        "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/3EorLNbj_2002326049_sd.mp4?ts=1626508314&rid=3009063014E119FC636C42FBC02D0085&rl=3&rs=IlLhnIrGJsLniSmWgwUmwnjBBWffRBRU&sign=79cb6e0eaef7a3e40af4e55a512f297d&ext=f0xw0mOJqGcf8yfMQn4khLo0vOAZ2Oret6FDS9VvANJChLlaNY31iFaOKLsBLFizcC9LAKrt1EayBUpZs8oKU62skYTL9jsdoMYU3jHvoYfevsxc4Be2xmN%2BuLAh1DyKVb9LnwDAb3v3hbBR9qwcunK%2Ba3HJSp1%2BcfILebGI%2FXxKEhuK%2Bl%2BI8wzqAAzYC8LPY6qrU2WHYbOUhrggo4n%2FLk3a%2FVhdrm2jDrwI38C%2FG%2BkV7GW6iPFQBPvkPIaLEw3Z",
        "size": 15378466,
        "validityTime": 1200,
        "needPay": false,
        "payInfo": null,
        "r": 240
      },
      "videoGroup": [{
        "id": 58100,
        "name": "现场",
        "alg": null
      }, {
        "id": 59101,
        "name": "华语现场",
        "alg": null
      }, {
        "id": 57108,
        "name": "流行现场",
        "alg": null
      }, {
        "id": 57110,
        "name": "饭拍现场",
        "alg": null
      }, {
        "id": 1100,
        "name": "音乐现场",
        "alg": null
      }, {
        "id": 5100,
        "name": "音乐",
        "alg": null
      }, {
        "id": 23120,
        "name": "蔡依林",
        "alg": null
      }],
      "previewUrl": null,
      "previewDurationms": 0,
      "hasRelatedGameAd": false,
      "markTypes": [109],
      "relateSong": [],
      "relatedInfo": null,
      "videoUserLiveInfo": null,
      "vid": "52CEC668254FF5380B51390998424187",
      "durationms": 97151,
      "playTime": 315038,
      "praisedCount": 1392,
      "praised": false,
      "subscribed": false
    }
  }, {
    "type": 1,
    "displayed": false,
    "alg": "onlineHotGroup",
    "extAlg": null,
    "data": {
      "alg": "onlineHotGroup",
      "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
      "threadId": "R_VI_62_DA24FE78D0312D754EB02CB13518263E",
      "coverUrl": "https://p2.music.126.net/YNqlOt0XK9d5EWadRJoqaQ==/109951163573476907.jpg",
      "height": 720,
      "width": 982,
      "title": "林子祥当年的这首歌，真不是一般人能唱的！",
      "description": "林子祥当年的这首歌，号称最快的粤语歌，真不是一般人能唱的！",
      "commentCount": 1077,
      "shareCount": 1980,
      "resolutions": [{
        "resolution": 240,
        "size": 18225775
      }, {
        "resolution": 480,
        "size": 30420822
      }, {
        "resolution": 720,
        "size": 48401235
      }],
      "creator": {
        "defaultAvatar": false,
        "province": 340000,
        "authStatus": 0,
        "followed": false,
        "avatarUrl": "http://p1.music.126.net/wlC7a5VUE47Vh3ycwGYsSQ==/18749971790193116.jpg",
        "accountStatus": 0,
        "gender": 1,
        "city": 340100,
        "birthday": 628704000000,
        "userId": 339174537,
        "userType": 204,
        "nickname": "悟空音乐随笔",
        "signature": "",
        "description": "",
        "detailDescription": "",
        "avatarImgId": 18749971790193116,
        "backgroundImgId": 2002210674180203,
        "backgroundUrl": "http://p1.music.126.net/bmA_ablsXpq3Tk9HlEg9sA==/2002210674180203.jpg",
        "authority": 0,
        "mutual": false,
        "expertTags": null,
        "experts": {
          "1": "音乐视频达人",
          "2": "华语音乐资讯达人"
        },
        "djStatus": 0,
        "vipType": 0,
        "remarkName": null,
        "avatarImgIdStr": "18749971790193116",
        "backgroundImgIdStr": "2002210674180203"
      },
      "urlInfo": {
        "id": "DA24FE78D0312D754EB02CB13518263E",
        "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/UTk0PTla_1576247582_shd.mp4?ts=1626508314&rid=3009063014E119FC636C42FBC02D0085&rl=3&rs=mTHwsoluiwgUccLsxKFkMnurxiodWkZU&sign=59d50e28e6b05e042bbede686bc404f8&ext=f0xw0mOJqGcf8yfMQn4khLo0vOAZ2Oret6FDS9VvANJChLlaNY31iFaOKLsBLFizcC9LAKrt1EayBUpZs8oKU62skYTL9jsdoMYU3jHvoYfevsxc4Be2xmN%2BuLAh1DyKVb9LnwDAb3v3hbBR9qwcunK%2Ba3HJSp1%2BcfILebGI%2FXxKEhuK%2Bl%2BI8wzqAAzYC8LPY6qrU2WHYbOUhrggo4n%2FLk3a%2FVhdrm2jDrwI38C%2FG%2BkV7GW6iPFQBPvkPIaLEw3Z",
        "size": 48401235,
        "validityTime": 1200,
        "needPay": false,
        "payInfo": null,
        "r": 720
      },
      "videoGroup": [{
        "id": 58100,
        "name": "现场",
        "alg": null
      }, {
        "id": 57105,
        "name": "粤语现场",
        "alg": null
      }, {
        "id": 57108,
        "name": "流行现场",
        "alg": null
      }, {
        "id": 59108,
        "name": "巡演现场",
        "alg": null
      }, {
        "id": 1100,
        "name": "音乐现场",
        "alg": null
      }, {
        "id": 5100,
        "name": "音乐",
        "alg": null
      }],
      "previewUrl": null,
      "previewDurationms": 0,
      "hasRelatedGameAd": false,
      "markTypes": null,
      "relateSong": [],
      "relatedInfo": null,
      "videoUserLiveInfo": null,
      "vid": "DA24FE78D0312D754EB02CB13518263E",
      "durationms": 217167,
      "playTime": 4223205,
      "praisedCount": 11164,
      "praised": false,
      "subscribed": false
    }
  }]
  let videoList=this.data.videoList;
  videoList.push(...newVideoList);
  this.setData({
    videoList
  })
  },
  //跳转至搜索界面
  toSearch(){
    wx.navigateTo(
      {
        url:'/pages/search/search'
      }
    )
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log('页面下拉刷新');
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
console.log('页面上拉触底');
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function ({from}) {
console.log(from);
if(from==='button'){
  return {
    title:'button转发内容',
    page:'/pages/video/video',//转发路径，当前页面的路径，必须从根目录出发
    imageUrl:'/static/images/nvsheng.jpg'
  }
}else{
  return {
    title:'menu转发内容',
    page:'/pages/video/video',//转发路径，当前页面的路径，必须从根目录出发
    imageUrl:'/static/images/nvsheng.jpg'
  }
}

  }
})