const list = [
  "馄饨",
  "拉面",
  "烩面",
  "热干面",
  "刀削面",
  "油泼面",
  "炸酱面",
  "炒面",
  "重庆小面",
  "米线",
  "酸辣粉",
  "土豆粉",
  "螺狮粉",
  "凉皮儿",
  "麻辣烫",
  "肉夹馍",
  "羊肉汤",
  "炒饭",
  "盖浇饭",
  "卤肉饭",
  "烤肉饭",
  "黄焖鸡米饭",
  "驴肉火烧",
  "川菜",
  "麻辣香锅",
  "火锅",
  "酸菜鱼",
  "烤串",
  "披萨",
  "烤鸭",
  "汉堡",
  "炸鸡",
  "寿司",
  "蟹黄包",
  "煎饼果子",
  "生煎",
  "炒年糕",
  "卤煮火烧",
  "春卷",
  "肠粉",
  "豆汁",
  "酸梅汤",
  "煲仔饭",
  "担担面",
  "小笼包",
  "莲子粥",
  "豌豆糕",
  "手抓饼",
  "菠萝饭",
  "臭豆腐",
  "烤苕皮",
  "胡辣汤",
  "炸鸡排",
  "牛杂",
  "米粉",
  "灌汤包",
  "锅盔",
  "串串香",
  "羊肉泡馍",
  "biangbiang面",
  "鸡蛋仔",
  "辣鱼蛋",
  "糖油粑粑",
  "棒棒鸡",
  "水果捞",
  "烤脑花",
  "爆米花",
  "我两拳"
]
let hash = {

}
const chishenme = (qq, st, callback, hasMine = true) => {
  let r
	if(st.match('嘉然') && Math.random() > 0.4) {
	  r = `${st}${hasMine ? '我' : ''}两拳`
	} else {
    r = `${st}${list[parseInt(Math.random() * list.length)]}`
  }
  if(hash[qq]) {
    if(hash[qq].st == st) {
      hash[qq].c ++
      if(hash[qq].c > 3 && hash[qq].exp > Date.now()) {
        callback(`${r}，爱吃不吃`)
        return
      }
    }
  }
  hash[qq] = {
    st,
    c: 1,
    exp: Date.now() + 30 * 60 * 1000,
    r
  }
  callback(r)
}

module.exports = {
  chishenme
}
