<template>
  <div class="friendList" >
   	<div class="searchBar">
      <el-input placeholder="搜索" v-model="friend.search" clearable></el-input>
      <i class="el-icon-plus" @click="friend.findShow=true"></i>
    </div>
    <el-collapse :value="friend.search?$store.getters.friend.map(v=>v.group_id):''">
      <el-collapse-item :name=item.group_id v-for="item in $store.getters.friend" :key=item.group_id class="friend" v-if="item.group_id!==null||!friend.search">
        <template slot="title">
          <div @contextmenu=handlerFriendGroup(item) v-if="!item.edit">{{item.group_name}}</div>
          <div class="edit" v-else @click.stop @keyup.stop>
            <el-input v-model="item.tmpName" size="mini" @blur=hideGroupEdit(item.group_id) @keyup.native.enter=changeGroupName(item)></el-input>
          </div>
        </template>
        <template v-if="item.group_id===null">
          <ul v-if="item.children">
            <li v-for="child in item.children">
              <img class="avatar" :src=child.avatar :alt=child.name>
              <div class="info">
                <h5>{{child.name}}</h5>
                <el-button size="mini" disabled v-if="child.status==0">已申请</el-button>
                <el-button size="mini" type="primary" v-else @click=receiveFriend(child.uid)>接 受</el-button>
              </div>
            </li>
          </ul>
        </template>
        <template v-else>
          <ul v-if="item.children.length&&!friend.search||(friend.search&&item.children.find(v=>v.name.indexOf(friend.search)>-1||v.nickname.indexOf(friend.search)>-1))">
            <li v-for="child in item.children" @dblclick=tapFriend(child) @contextmenu=handlerFriend(child,$event)
            v-if="!friend.search||friend.search&&child.name.indexOf(friend.search)>-1||child.nickname.indexOf(friend.search)>-1">
              <img class="avatar" :src=child.avatar :alt=child.name>
              <div class="info" v-if="!child.edit">
                <div class="top">
                  <h5>{{child.nickname||child.name}}</h5>
                  <span v-if="child.nickname">({{child.name}})</span>
                </div>
                <p>{{child.summary}}</p>
              </div>
              <div class="edit" v-else>
                <el-input v-model="child.tmpName" size="mini" @blur=hideUserEdit(child.uid) @keyup.native.enter=changeUserName(child)></el-input>
              </div>
            </li>
          </ul>
          <p v-else class="kong">暂无数据</p>
        </template>
      </el-collapse-item>
    </el-collapse>
    <div class="newGroup" v-if="newGroup.edit">
      <el-input v-model="newGroup.tmpName" size="mini" @blur="newGroup.edit=false" @keyup.native.enter=insertGroup></el-input>
    </div>
    <i-find v-model="friend.findShow" v-if="friend.findShow"></i-find>
  </div>
</template>

<script>
import socket from '@/assets/socket'
import find from '@/components/find'
export default {
  data(){
    return {
    	friend:{
        findShow:false,
        search:null,
        insertGroupEdit:false
      },
      newGroup:{
        edit:false,
        tmpName:null
      }
    }
  },
  components:{'i-find':find},
  created(){},
  methods:{
  	tapFriend(item){//好友列表 双击好友
      let data=this.$store.getters.message.find(v=>v.uid==item.uid)
      if(data){
        this.$emit('tapItem',data)
      }else{
        this.$ajax({
          url:'/insertRoom',
          method:'post',
          data:{uid:item.uid}
        }).then(res=>{
          item.room_id=res.room_id
          this.$store.commit('insertMessage',item)
          this.$emit('tapItem',item)
          socket.emit('insertRoom',{uid:item.uid,room_id:res.room_id,time:res.time})
          socket.emit('joinRoom',res.room_id)
        })
      }
    },
  	handlerFriendGroup(item){
      if(item.edit||item.group_id===null){return false}
      let MenuItem = this.$electron.remote.MenuItem,
        Menu = this.$electron.remote.Menu,
        myMenu = new Menu(),
        _this=this
      let addBtn=new MenuItem({
        label: '添加分组',
        click(){
          _this.newGroup={
            edit:true,
            tmpName:null
          }
        }
      })
      myMenu.append(addBtn)
      if(item.isdelete){
        let renameBtn=new MenuItem({
          label: '重命名',
          click(){
            _this.showGroupEdit(item.group_id,item.group_name)
          }
        })
        myMenu.append(renameBtn)
        let delBtn=new MenuItem({
          label: '删除分组',
          click(){
            _this.deleteGroup(item.group_id)
          }
        })
        myMenu.append(delBtn)
      }
      
      myMenu.popup(this.$electron.remote.getCurrentWindow())
    },
    handlerFriend(item,event){
      if(item.edit){return false}
      let MenuItem = this.$electron.remote.MenuItem,
        Menu = this.$electron.remote.Menu,
        myMenu = new Menu(),
        _this=this
      let sendBtn=new MenuItem({
        label: '发送消息',
        click(){
          _this.tapFriend(item)
        }
      })
      myMenu.append(sendBtn)
      let editBtn=new MenuItem({
        label:'修改备注',
        click(){
          _this.showUserEdit(item.uid,item.nickname)
        } 
      })
      myMenu.append(editBtn)
      let moveBtn=new MenuItem({
        label:'移动好友至',
        submenu:_this.$store.getters.friend.map(v=>({
          label:v.group_name,
          click(){
            _this.$ajax({
              method:'post',
              url:'changeFriendGroup',
              data:{uid:item.uid,group_id:v.group_id}
            }).then(_=>{
              let friendItem=_this.$store.getters.friendItem(item.uid)
              _this.$store.commit('deleteFriend',{uid:item.uid})
              _this.$store.commit('insertFriend',{
                group_id:v.group_id,
                data:friendItem
              })
            })
          }
        }))
      })
      myMenu.append(moveBtn)
      let infoBtn=new MenuItem({
        label:'查看好友信息',
        click(){
        	_this.$store.commit('updateUser',{
            uid:item.uid,
            show:true,
            left:event.pageX,
            top:event.pageY
          })
        } 
      })
      myMenu.append(infoBtn)
      let deleteBtn=new MenuItem({
        label: '删除好友',
        click(){
          let room_id=_this.$store.getters.message.find(v=>v.uid==item.uid).room_id
          _this.$ajax({
		  			method:'post',
		  			url:'deleteFriend',
		  			data:{uid:item.uid,room_id}
		  		}).then(res=>{
		  			socket.emit('deleteFriend',{uid:item.uid,room_id})
		  		})
        }
      })
      myMenu.append(deleteBtn)
      myMenu.popup(this.$electron.remote.getCurrentWindow())
    },
    insertGroup(){
      this.$ajax({
        method:'post',
        url:'insertFriendGroup',
        data:{name:this.newGroup.tmpName}
      }).then(res=>{
        this.$store.commit('insertFriendGroup',{
          group_id:res.id,
          group_name:this.newGroup.tmpName,
          isdelete:1,
          children:[]
        })
        this.newGroup.edit=false
      })
    },
    deleteGroup(id){
      this.$ajax({
        method:'post',
        url:'deleteFriendGroup',
        data:{id}
      }).then(res=>{
        let items=this.$store.getters.friendGroup(id)
        this.$store.commit('insertFriends',{
          group_id:this.$store.getters.friend[0].group_id,
          data:items.children
        })
        this.$store.commit('deleteFriendGroup',{id})
      })
    },
    changeGroupName(item){
      this.$ajax({
        method:'post',
        url:'changeFriendGroupname',
        data:{id:item.group_id,name:item.tmpName}
      }).then(res=>{
        this.$store.commit('updateFriendGroup',{
          group_id:item.group_id,
          data:{
            group_name:item.tmpName,
            edit:false,
            tmpName:null
          }
        })
      })
    },
    showGroupEdit(id,name){
      this.$store.commit('updateFriendGroup',{
        group_id:id,
        data:{
          edit:true,
          tmpName:name
        }
      })
    },
    hideGroupEdit(id){
      this.$store.commit('updateFriendGroup',{
        group_id:id,
        data:{
          edit:false,
          tmpName:null
        }
      })
    },
    showUserEdit(uid,name){
      this.$store.commit('updateFriendOne',{
        uid,
        data:{
          edit:true,
          tmpName:name
        }
      })
    },
    hideUserEdit(uid){
      this.$store.commit('updateFriendOne',{
        uid,
        data:{
          edit:false,
          tmpName:null
        }
      })
    },
    changeUserName(item){
      this.$ajax({
        method:'post',
        url:'changeUserNickname',
        data:{uid:item.uid,nickname:item.tmpName}
      }).then(res=>{
        let room_id=this.$store.getters.message.find(v=>v.uid==item.uid).room_id
        this.$store.commit('updateMessageOne',{
          id:room_id,
          data:{
            nickname:item.tmpName
          }
        })
        this.$store.commit('updateFriendOne',{
          uid:item.uid,
          data:{
            nickname:item.tmpName
          }
        })
        this.hideUserEdit(item.uid)
      })
    },
    receiveFriend(uid){//同意添加好友
      this.$ajax({
        url:'/receiveFriend',
        method:'post',
        data:{uid}
      }).then(res=>{
        socket.emit('receiveFriend',uid)
      })
    }
  }
}
</script>

<style scoped>
.searchBar{
  display: flex;
  padding: 8px;
}
.searchBar .el-input{
  flex: 1;
}
.searchBar .el-input>>>input{
  height: 30px;
  line-height: 30px;
  padding: 0 10px
}
.searchBar i{
  width: 30px;height: 30px;
  cursor: pointer;
  margin-left: 5px;
  border-radius: 4px;
  text-align: center;
  line-height: 30px;
  border: 1px solid #dcdfe6;
}
.friendList li{
  padding: 8px;
  display: flex;
  line-height: 20px
}
.friend{
  overflow: hidden
}
.friend>>>.el-collapse-item__header{
  padding-left: 8px;
  border-bottom-color:#ebeef5;
  color: #303133 !important;
}
.friend>>>.el-collapse-item__content{
  padding-bottom: 0
}
.friend li:not(:nth-child(1)){
  border-top: 1px solid #ebeef5
}
.friend .avatar{
	height: 40px;width: 40px
}
.friend .info{
  width: 136px;
  margin-left: 8px;
  line-height: 20px
}
.friend .top{
  display: flex;
}
.friend h5{
	user-select:none;
  font-weight: normal;
  color: #303133;
  font-size: 14px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis
}
.friend .top span{
  color: #909399;
  font-size: 14px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis
}
.friend .info p{
	user-select:none;
  color: #909399;
  font-size: 12px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis
}
.friend .edit{
  margin-left: 8px;
  display: flex;
  align-items: center
}
.friend>>>.el-collapse-item__header{
  position: relative;
}
.friend>>>.el-collapse-item__header .edit{
  position: absolute;top: 0;left: 0;
  width: 100%;
  height: 100%;
  background: #fff;
  margin: 0;padding: 0 8px;
}
.friend .edit>>>input{
  padding: 0 5px
}
.friend .kong{
  text-align: center;
  line-height: 30px;
  color: #909399;
  width: 100%;
}
.newGroup{
  padding: 8px
}
</style>
