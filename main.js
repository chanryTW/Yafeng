// 修改設定
// $('#exampleModal').on('show.bs.modal', function (event) {
// 	var button = $(event.relatedTarget) // Button that triggered the modal
// 	var recipient = button.data('whatever') // Extract info from data-* attributes
// 	// If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
// 	// Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
// 	var modal = $(this)
// 	modal.find('.modal-title').text('New message to ' + recipient)
// 	modal.find('.modal-body input').val(recipient)
// })


var Explosion1 = "";
var Explosion2 = "";
var ExplosionOpen = false;
var ExplosionCheck = "322561";
var db = firebase.firestore();
var snd = new Audio("balarm.wav");
snd.loop = true;

// 啟動警報
function ExplosionStart(NowTime) {
    console.log("啟動警報");
    ExplosionCheck = NowTime; //標示這個時間點已啟動過
    switch(NowTime)
    {
        case Explosion1:
            db.collection("Yafeng").doc("AlarmTime").update({
                ExplosionOpen1: true
            })
            .then(function() {
                console.log("更新Explosion1狀態完成，標記為已警報");
            });
        break;
        case Explosion2:
            db.collection("Yafeng").doc("AlarmTime").update({
                ExplosionOpen2: true
            })
            .then(function() {
                console.log("更新Explosion2狀態完成，標記為已警報");
            });
        break;
    }
    // 更新警報次數
    ExplosionUpdate();

    ExplosionOpen = true;
    document.styleSheets[0].addRule('#app::before','animation-duration:1.5s;animation-iteration-count:infinite'); //開始閃紅燈
    document.getElementById("StopBtn").style.display="block"; //顯示停止按鈕
    document.getElementById("ChangeBtn").style.display="none"; //不顯示修改按鈕
    
    //播放音效
    snd.play();
}

// 關閉警報
function ExplosionStop() {
    console.log("關閉警報");

    ExplosionOpen = false;
    document.styleSheets[0].addRule('#app::before','animation-duration:1.5s;animation-iteration-count:0'); //停止閃紅燈
    document.getElementById("StopBtn").style.display="none"; //不顯示停止按鈕
    document.getElementById("ChangeBtn").style.display="inline-block"; //顯示修改按鈕
    
    //停止音效
    snd.pause();
    snd.currentTime = 0;
}

// 更新警報次數
function ExplosionUpdate() {
    db.collection("Yafeng").doc("AlarmTime").get().then(function(doc) {
    if (doc.exists) {
        var count = 0;
        var total = 0;
        if (doc.data().ExplosionOpen1==true) {
            count +=1;
        } 
        if (doc.data().ExplosionOpen2==true) {
            count +=1;
        }
        if (doc.data().Explosion1!="999999") {
            total +=1;
        }
        if (doc.data().Explosion2!="999999") {
            total +=1;
        }
        document.getElementById("SpanCount").innerText = count+"/"+total;
    } else {
        console.log("找不到ExplosionOpen");
    }
    }).catch(function(error) {
        console.log("讀取ExplosionOpen失敗：", error);
    });
}

//如果關閉警報被點擊
function StopBtnClick() {
    // 關閉警報
    ExplosionStop();
}

//在月份、日期、小時，如小於10補0
var padDate = function (value) {
    return value<10?'0'+value:value;
};

var app = new Vue({
    el:'#app',
    data:{
        date:new Date()
    },
    filters:{   //過濾器
        formatDate:function (value) {   //value為需要過濾的數據
            var date = new Date();
            var year = date.getFullYear();
            var month = padDate(date.getMonth()+1);
            var day = padDate(date.getDate());
            var hours = padDate(date.getHours());
            var minutes = padDate(date.getMinutes());
            var seconds = padDate(date.getSeconds());
            var NowTime = day.toString()+hours.toString()+minutes.toString();

            // <<<<<警報事件>>>>>
            if (NowTime==Explosion1||NowTime==Explosion2) { //如果現在時間符合警報時間
                if (NowTime!=ExplosionCheck) { //檢查是不是沒有啟動過
                    if (ExplosionOpen==false) { //如果警報是關閉的
                        // 啟動警報
                        ExplosionStart(NowTime);
                    }
                }
            } else { //如果現在時間不符合警報時間
                if (ExplosionOpen==true) { //檢查警報是否開著，如果開著就讓它停止
                    // 關閉警報
                    ExplosionStop();
                }
            }
            
            return year+'-'+month+'-'+day+' '+hours+':'+minutes+':'+seconds;
        }
    },
    mounted: function () {  //定時器，每秒更新
        var _this = this;
        this.timer = setInterval(function () {
            _this.date = new Date(); //修改date
        },1000);
    },
    beforeDestory:function () { //清除定時器
        if (this.timer){
            clearInterval(this.timer);  //在關閉前清除定時器
        }
    }

})

var date = new Date();
var year = date.getFullYear();
var month = padDate(date.getMonth()+1);
var day = padDate(date.getDate());
var hours = padDate(date.getHours());
var minutes = padDate(date.getMinutes());
var seconds = padDate(date.getSeconds());

// 更新後台記錄
var isIE = navigator.userAgent.search("MSIE") > -1;
var isIE7 = navigator.userAgent.search("MSIE 7") > -1;
var isFirefox = navigator.userAgent.search("Firefox") > -1;
var isOpera = navigator.userAgent.search("Opera") > -1;
var isSafari = navigator.userAgent.search("Safari") > -1;
if (isIE7) {
    browser = 'IE7';
}
if (isIE) {
    browser = 'IE';
}
if (isFirefox) {
    browser = 'Firefox';
}
if (isOpera) {
    browser = 'Opera';
}
if (isSafari) {
    browser = 'Safari/Chrome';
}
db.collection("Record").doc(year+'-'+month+'-'+day+' '+hours+':'+minutes+':'+seconds).set({
    Browser: browser
})
.then(function(docRef) {
})
.catch(function(error) {
    console.error("記錄錯誤：", error);
});

// 更新資料
db.collection("Yafeng").doc("AlarmTime").onSnapshot(function(doc) {
    console.log("更新資料中...");
    ExplosionUpdate();
    if (doc.exists) {
        console.log("最近更新警報時間為", doc.data().UpdateYM);
        // 確認本月是否已有警報
        var date = new Date();
        if (year+month.toString() == doc.data().UpdateYM) {
            console.log("判斷本月已有更新警報");
            // 提取警報12
            Explosion1 = doc.data().Explosion1;
            Explosion2 = doc.data().Explosion2;
        } else {
            console.log("判斷本月沒有更新警報，將進行更新...");
            // 如果本月沒有更新警報
            // 跑亂數得日期+小時+分鐘
            var Explosion = function () {
                var max = new Date(year,month,0).getDate(); //取得本月最後一天
                var min = day; //取得今日日期
                var ExplosionDay = padDate(Math.floor(Math.random()*(max-min+1))+min);

                max = 17;
                min = 9;
                do {
                    var ExplosionHours = padDate(Math.floor(Math.random()*(max-min+1))+min);
                } while (ExplosionHours==12);
                
                max = 59;
                min = 0;
                var ExplosionMinutes = padDate(Math.floor(Math.random()*(max-min+1))+min);

                return ExplosionDay.toString()+ExplosionHours.toString()+ExplosionMinutes.toString();
            };
            
            // 如果亂數出來的時間在現在時間之前，則再換
            do {
                Explosion1 = Explosion();
            } while (Explosion1<=day.toString()+hours.toString()+minutes.toString());
            // 至此產出Explosion1

            // 如果本月只剩六天，那就只用一個警報
            if (day>24) {
                Explosion2 = "999999";
            } else {
                // 兩警報間隔3天以上
                do { 
                    // 如果亂數出來的時間在現在時間之前，則再換
                    do {
                        Explosion2 = Explosion();
                    } while (Explosion2<=day.toString()+hours.toString()+minutes.toString());
                } while (Math.abs(Number(Explosion1.substr(0,2))-Number(Explosion2.substr(0,2)))<3);
            }
            // 至此產出Explosion2

            // 開始寫入DB
            db.collection("Yafeng").doc("AlarmTime").update({
                UpdateYM: year+month.toString(),
                Explosion1: Explosion1,
                Explosion2: Explosion2,
                ExplosionOpen1: false,
                ExplosionOpen2: false
            })
            .then(function() {
                console.log("更新本月警報時間完成!");
            });
        }
    } else {
        console.log("找不到UpdateYM");
    }
})