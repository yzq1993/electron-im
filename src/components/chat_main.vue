<template>
  <div class="chat_main">
    <div class="chatBox scrollbar" ref="chatBox" @scroll=scrollLoading>
      <ul v-if="list[room_id]">
        <li v-for="item in list[room_id].msg" :class="{my:item.my}">
          <img :src=item.avatar class="avatar" @click=showUser(item.uid,$event)>
          <div class="info">
            <div class="top"><h5>{{item.my||!item.nickname?item.name:item.nickname}}</h5><span>{{item.time|nowDate}}</span></div>
            <p v-if="item.type==1" v-html="item.content"></p>
            <p v-else><img :src=item.content></p>
          </div>
        </li>
      </ul>
    </div>
    <div class="chat_input">
      <div class="chat_input_head">
        <div class="chat_input_btn">
          <div class="emotion">
            <img src="../images/emotion.png" @click="emotionShow=!emotionShow">
            <i-emotion @tap=insertEmotion v-if="emotionShow"></i-emotion>
          </div>
          <div class="image"><img src="../images/image.png"><input type="file" name="" @change=sendImage accept="image/png,image/jpg,image/jpeg,image/gif"></div>
        </div>
        <!-- <el-button>聊天记录</el-button> -->
      </div>
      <div class="chat_input_box">
        <div contentEditable class="textarea" @keydown.enter.prevent=send ref="chatInput" v-html="content"></div>
        <el-button @click=send type="primary">发送</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import socket from '@/assets/socket'
import emotion from './emotion'
export default {
  data(){
    return{
      emotionShow:false,
      list:{},
      content:'',
      timeout:null,
    }
  },
  mounted(){
    this.listen()
  },
  components:{'i-emotion':emotion},
  props:['room_id'],
  methods:{
    logout(){
      this.$ajax({
        method:'post',
        url:'/logout'
      }).then(res=>{
        socket.emit('logout')
        this.$router.push('/login')
        sessionStorage.removeItem('token')
      })
    },
    showUser(uid,event){
      this.$store.commit('updateUser',{
        uid:uid,
        show:true,
        left:event.pageX,
        top:event.pageY
      })
    },
    listen(){
      if(!sessionStorage.token){return false}
      let list,nickname,isMy
      socket.on('receive',res=>{
        list=this.$store.getters.message
        let index=list.findIndex(v=>v.room_id==res.room_id)
        if(index>-1){
          list[index].content=res.content
          list[index].time=res.time
          list[index].type=res.type
          nickname=list[index].nickname
        }else{
          list.push({
            name:res.name,
            nickname:res.nickname,
            avatar:res.avatar,
            type:res.type,
            uid:res.uid,
            room_id:res.room_id,
            time:res.time,
            content:res.content
          })
        }
        isMy=res.uid==this.$store.state.owner.uid
        list.sort((a,b)=>new Date(b.time)-new Date(a.time))
        this.$store.commit('updateMessage',list)
        if(this.room_id==res.room_id){
          this.list[this.room_id].msg.push({...res,my:isMy,nickname:isMy?null:nickname})
          this.srcollBottom()
        }
      })
    },
    getMessage(room_id,page){
      this.$ajax({
        url:'/message',
        params:{room_id,page}
      }).then(res=>{
        this.list[room_id].msg.unshift(...res)
        if(page==1){
          this.srcollBottom()
        }else{
          let h=this.$refs.chatBox.scrollHeight
          this.$nextTick(()=>{
            this.$refs.chatBox.scrollTop=this.$refs.chatBox.scrollHeight-h
          })
        }
        if(res.length==0){
          this.list[room_id].canLoad=false
        }
      })
    },
    srcollBottom(){
      this.$nextTick(()=>{
        this.$refs.chatBox.scrollTop=this.$refs.chatBox.scrollHeight
      })
    },
    scrollLoading(){
      if(!this.list[this.room_id].canLoad){return false}
      if(this.timeout){
        clearTimeout(this.timeout)
      }
      this.timeout=setTimeout(()=>{
        if(this.$refs.chatBox.scrollTop<50){
          this.getMessage(this.room_id,++this.list[this.room_id].page)
        }
      },300)
    },
    insertEmotion(item){
      let src=require('../images/emoji/emoji_'+item+'.png')
      document.execCommand('insertImage',null,src)
      this.emotionShow=false
    },
    sendImage(event){
      let file=event.target.files[0],
        formData=new FormData();
      formData.append('file',file)
      this.$ajax({
        method:'post',
        url:'/upload',
        data:formData
      }).then(res=>{
        if(!this.room_id){return false}
        socket.emit('send', {
          room_id:this.room_id,
          type:2,
          content:res.url
        });
      })
    },
    send(){
      this.content=this.$refs.chatInput.innerHTML
      if(!this.room_id||!this.content){return false}
      socket.emit('send', {
        room_id:this.room_id,
        type:1,
        content:this.content
      });
      this.content=''
      this.$refs.chatInput.innerHTML=''
    }
  },
  watch:{
    'room_id':function(val){
      this.$refs.chatInput.focus()
      this.content=''
      this.timeout=null
      if(this.list[val]){
        this.srcollBottom()
      }else{
        this.$set(this.list,val,{
          msg:[],
          page:1,
          canLoad:true
        })
        this.getMessage(val,1)
      }
    }
  }
}
</script>

<style scoped>
  .chat_main{
    min-width: 330px;
    flex: 1 0 auto;
    background: #f5f5f5;
    height: 100%;
    display: flex;
    flex-direction: column
  }
  .chatBox{
    flex: 1 0 0;
    position: relative
  }
  
  .chat_main ul{
    padding: 10px 20px;
  }
  .chat_main .avatar{
    height: 40px;width: 40px;
    border-right: 4px;
    cursor: pointer
  }
  .chat_main li{
    display: flex;
    padding: 8px 0
  }
  .chat_main li.my{
    flex-direction: row-reverse
  }
  .chat_main .info{
    margin-left: 8px;
    line-height: 20px
  }
  .chat_main li.my .info{
    margin-right: 8px;
  }
  .chat_main .top{
    display: flex
  }
  .chat_main .top h5{
    color: #303133;
    font-size: 14px;
    font-weight: normal
  }
  .chat_main .top span{
    margin-left: 8px;
    color: #909399
  }
  .chat_main p{
    min-height: 30px;
    color: #333;
    background: #fff;
    border: 1px solid #eee;
    padding: 5px 8px;
    position: relative
  }
  .chat_main p>>>img{
    vertical-align: middle;
  }
  .chat_main p:after{
    content: '';
    position: absolute;top: 4px;left: -6px;
    height: 8px;width: 8px;
    background: #fff;
    transform: rotate(45deg);
    border: 1px solid #eee;
    border-right: 0;
    border-top: 0;
  }
  .chat_main li.my p:after{
    left: auto;right: -6px;
    border: 1px solid #eee;
    border-left: 0;
    border-bottom: 0;
  }
  .chat_main p img{
    display: block;
    max-width: 100%;
    max-height: 100%
  }
  .chat_main .chat_input{
    border-top: 1px solid #d8d8d8;
  }
  .chat_input_box{
    height: 80px;
    display: flex;
  }
  .chat_main .chat_input .textarea{
    border-radius: 0;
    border: 0;
    flex: 1;
    height: 100%;
    padding: 10px;
    background: #fff;
    outline: none;
    appearance: none;
    font-family: inherit
  }
  .chat_main .chat_input .textarea>>>img{
    vertical-align: middle
  }
  .chat_main .el-button{
    border-radius: 0;
    border: none;
    width: 100px;
  }
  .chat_input_head{
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .chat_input_head .el-button{
    background: #f5f5f5
  }
  .chat_input_btn{
    display: flex;
    align-items: center;
    height: 38px;
  }
  .chat_input_btn .emotion{
    position: relative
  }
  .chat_input_btn .image{
    position: relative;
  }
  .chat_input_btn .image input{
    opacity: 0;
    position: absolute;top: 0;left: 0;
    width: 100%;height: 100%;
    cursor: pointer;
    font-size: 0
  }
  .chat_input_head img{
    height: 22px;
    cursor: pointer;
    margin: 0 8px;
    display: block
  }

</style>
