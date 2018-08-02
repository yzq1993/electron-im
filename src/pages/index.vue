<template>
  <div class="main">
    <el-container>
      <el-aside width="260px">
        <el-container>
          <el-header height="70px">
            <div class="owner_info">
              <img :src=$store.state.owner.avatar @click=showEdit>
              <div>
                <h2>{{$store.state.owner.name}}</h2>
                <p>{{$store.state.owner.summary}}</p>
              </div>
            </div>
          </el-header>
          <el-main>
            <el-tabs type="border-card" tab-position="left" v-model="activeTab">
              <el-tab-pane name="message">
                <i icon="message" slot="label"></i>
                <message-list :room_id=client.room_id @tapItem=tapItem></message-list>
              </el-tab-pane>
              <el-tab-pane name="friend">
                <i icon="friend" slot="label"></i>
                <friend-list @tapItem=tapItem></friend-list>
              </el-tab-pane>
              <el-tab-pane name="group">
                <i icon="group" slot="label"></i>
                <group-list @tapItem=tapItem></group-list>
              </el-tab-pane>
            </el-tabs>
          </el-main>
        </el-container>
      </el-aside>
      <el-main>
        <el-container>
          <el-header height="70px">
            <div class="room_title">
              <div class="room_icon">
                <i class="el-icon-minus" @click=minimize></i>
                <i class="icon-logout" @click=logout></i>
                <i class="el-icon-close" @click=closeMain></i>
              </div>
              <h2>{{client.room_id&&client.room_name}}</h2>
              <i class="el-icon-more" @click="detailShow=!detailShow"></i>
            </div>
          </el-header>
          <el-main>
            <chat-main :room_id=client.room_id></chat-main>
          </el-main>
        </el-container>
      </el-main>
      <el-aside v-if="detailShow" width="280px">
        <room-detail :room_id=client.room_id  @tapItem=tapItem></room-detail>
      </el-aside>
    </el-container>
    <user-info v-if="$store.state.user.show" @tapItem=tapItem @showEdit=showEdit></user-info>
    <i-edit v-model="userEdit" v-if="userEdit"></i-edit>
  </div>
</template>
<script>
import socket from '@/assets/socket'
import messageList from '@/components/messageList'
import friendList from '@/components/friendList'
import groupList from '@/components/groupList'
import chatMain from '@/components/chat_main'

import userInfo from '@/components/user_info'
import roomDetail from '@/components/room_detail'
import edit from '@/components/edit'
export default {
  data(){
    return{
      activeTab:'message',
      client:{
        room_id:null,
        room_name:null
      },
      detailShow:false,
      userEdit:false
    }
  }, 
  created(){
    this.$ajax({
      url:'/main'
    }).then(res=>{
      if(res.newFriend.length){
        res.friend.unshift({group_id:null,group_name:'新的好友',children:res.newFriend})
      }
      this.$store.commit('updateMessage',res.message)
      this.$store.commit('updateFriend',res.friend)
      this.$store.commit('updateGroup',res.group)
      this.$store.commit('updateOwner',res.user)
      socket.emit('login',res.message.map(v=>v.room_id))
      if(!res.message.length){return false}
      this.tapItem(res.message[0])
    })
  },
  components:{
    messageList,friendList,groupList,
    chatMain,userInfo,roomDetail,'i-edit':edit
  },
  mounted(){
    if(!sessionStorage.token){return false}
    this.listen()
  },
  methods:{
    listen(){
      socket.on('insertRoom',res=>{
        this.$store.commit('insertMessage',res)
        socket.emit('joinRoom',res.room_id)
      })
      socket.on('receiveFriend',res=>{
        this.newToFriend(res.uid)
      })
      socket.on('applyFriend',res=>{
        this.toNewFriend(res)
      })
      socket.on('deleteFriend',res=>{
        this.deleteFriend(res)
      })
      socket.on('joinGroup',res=>{
        this.joinGroup(res)
      })
      socket.on('changeGroupname',res=>{
        this.changeGroupname(res)
      })
      socket.on('changeGroupAvatar',res=>{
        this.changeGroupAvatar(res)
      })
    },
    minimize(){
      this.$electron.remote.getCurrentWindow().minimize()
    },
    closeMain(){
      this.$electron.remote.getCurrentWindow().close()
    },
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
    showEdit(){
      this.userEdit=true
    },
    tapItem(item){
      this.activeTab='message'
      if(this.client.room_id&&this.client.room_id==item.room_id){return false}
      this.client.room_id=item.room_id
      let room=this.$store.getters.message.find(v=>v.room_id==item.room_id)
      this.client.room_name=room.nickname||room.name
      this.detailShow=false
    },
    newToFriend(uid){//新的好友->我的好友
      let list=this.$store.getters.friend,
        user=list[0].children.find(v=>v.uid==uid)
      list[0].children=list[0].children.filter(v=>v.uid!=uid)
      list[1].children.unshift({uid:user.uid,name:user.name,avatar:user.avatar,summary:user.summary,nickname:null})
      if(list[0].children.length==0){
        list.shift()
      }
      this.$store.commit('updateFriend',list)
    },
    toNewFriend(res){//添加好友
      let list=this.$store.getters.friend,
        item=list.find(v=>v.group_id===null)
      if(item){
        item.children.unshift({...res,nickname:null})
      }else{
        list.unshift({group_id:null,group_name:'新的好友',children:[{...res,nickname:null}]})
      }
      this.$store.commit('updateFriend',list)
    },
    deleteFriend(res){//删除好友
      if(res.room_id){
        this.$store.commit('deleteMessage',{id:res.room_id})
        let item=this.$store.getters.message.find(v=>v.room_id!=res.room_id)
        this.$emit('tapItem',{room_id:item&&item.room_id})
      }
      this.$store.commit('deleteFriend',{uid:res.uid})
    },
    joinGroup(res){//加入群组
      this.$store.commit('insertGroup',{
        id:res.group_id,
        name:res.group_name,
        avatar:res.group_avatar,
        room_id:res.room_id,
      })
      this.$store.commit('insertMessage',{
        group_id:res.group_id,
        name:res.group_name,
        avatar:res.group_avatar,
        room_id:res.room_id,
        time:res.time
      })
      socket.emit('insertRoom',{group_id:res.group_id,room_id:res.room_id})
      socket.emit('joinRoom',res.room_id)
      this.tapItem({room_id:res.room_id})
    },
    changeGroupname(res){
      let room_id=this.$store.getters.group.find(v=>v.id==res.id).room_id
      this.$store.commit('updateMessageOne',{
        id:room_id,
        data:{
          name:res.name
        }
      })
      this.$store.commit('updateGroupOne',{
        id:res.id,
        data:{
          name:res.name
        }
      })
    },
    changeGroupAvatar(res){
      let room_id=this.$store.getters.group.find(v=>v.id==res.id).room_id
      this.$store.commit('updateMessageOne',{
        id:room_id,
        data:{
          avatar:res.avatar
        }
      })
      this.$store.commit('updateGroupOne',{
        id:res.id,
        data:{
          avatar:res.avatar
        }
      })
    }
  }
}
</script>
<style scoped>
  .main,.el-container{
    height: 100%
  }
  .el-container .el-main{
    overflow: inherit
  }
  .el-aside .el-main{
    overflow: auto
  }
  .el-header{
    height: 70px;
    padding: 0;
    border-bottom: 1px solid #d8d8d8;
  }
  .el-aside{
    border-right: 1px solid #d8d8d8;
  }
  .el-main+.el-aside{
    border-right: 0
  }
  .el-main{
    flex: 1 0 0;
    padding: 0
  }
  .owner_info{
    display: flex;
    padding: 10px;
    border-bottom: 1px solid #d8d8d8;
    position: relative;
    -webkit-app-region: drag
  }
  .owner_info img{
    height: 50px;width: 50px;
    margin-right: 10px;
    cursor: pointer;
    -webkit-app-region: no-drag
  }
  .owner_info div{
    width: 180px;
    line-height: 20px;
    -webkit-app-region: no-drag
  }
  .owner_info h2{
    font-size: 16px;
    line-height: 30px;
  }
  .owner_info p{
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap
  }
  .el-main .el-tabs{
    border: none;
    height: 100%
  }
  .el-main>>>.el-tabs__header{
    margin: 0;
    background: #f5f5f5
  }
  .el-main>>>.el-tabs__item{
    display: flex;
    align-items: center;
    height: 56px;
    margin: 0 !important;
    border: 0 !important;
    border-right: 1px solid #d1dbe5 !important
  }
  .el-main>>>.el-tabs__content{
    padding: 0;
    margin: 0;
    height: 100%;
    overflow: auto;
    background: #fff
  }
  .room_title{
    position: relative;
    height: 70px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #d8d8d8;
    background: #fff;
    padding:0 10px 0 20px;
    flex-shrink: 0;
    -webkit-app-region: drag
  }
  .room_title .room_icon{
    position: absolute;top: 0;right: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  .room_icon i{
    cursor: pointer;
    margin-right: 5px;
    padding: 5px;
    font-size: 15px;
    -webkit-app-region: no-drag
  }
  .room_title .icon-logout{
    width: 25px;height: 25px;
    background: url('../images/logout.png') no-repeat;
    background-size: 15px;
    background-position: center center
  }
  .room_title h2{
    font-size: 20px;
    flex: 1 0 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    -webkit-app-region: no-drag
  }
  .room_title>i{
    padding:10px;
    cursor: pointer;
    font-size: 15px;
    height: 35px;
    -webkit-app-region: no-drag
  }
</style>
