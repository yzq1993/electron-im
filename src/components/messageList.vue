<template>
  <ul class="message">
    <li v-for="item in $store.getters.message" :class="{active:item.room_id==room_id}" @click=tapItem(item) @contextmenu=handlerRoom(item,$event)>
      <img :src=item.avatar class="avatar">
      <div class="info" v-if="!item.edit">
        <div class="top"><h5>{{item.nickname||item.name}}</h5><span>{{item.time|nowDate}}</span></div>
        <p v-html="item.content" v-if="item.type==1"></p>
        <p v-if="item.type==2">[图片]</p>
      </div>
      <div class="edit" v-else>
      	<el-input v-model="item.tmpName" size="mini" @blur=hideEdit(item.room_id) @keyup.native.enter=changeName(item)></el-input>
      </div>
    </li>
  </ul>
</template>

<script>
import socket from '@/assets/socket'
export default {
  data(){
    return {

    }
  },
  created(){},
  props:['room_id'],
  methods:{
  	tapItem(item){
  		this.$emit('tapItem',{room_id:item.room_id})
  	},
  	handlerRoom(item,event){
      if(item.edit){return false}
      let MenuItem = this.$electron.remote.MenuItem,
        Menu = this.$electron.remote.Menu,
        myMenu = new Menu(),
        _this=this
      let sendBtn=new MenuItem({
        label: '发送消息',
        click(){
          _this.tapItem(item)
        }
      })
      myMenu.append(sendBtn)
      if(item.uid){
        let editBtn=new MenuItem({
          label:'修改备注',
          click(){
          	_this.showEdit(item.room_id,item.nickname)
          } 
        })
        myMenu.append(editBtn)
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
      }else if(item.group_id){
        let editBtn=new MenuItem({
          label:'修改群名',
          click(){
            _this.showEdit(item.room_id,item.name)
          }
        })
        myMenu.append(editBtn)
        let deleteBtn=new MenuItem({
          label: '退出群组',
          click(){
            _this.$ajax({
			  			method:'post',
			  			url:'exitGroup',
			  			data:{id:item.group_id,room_id:item.room_id}
			  		}).then(res=>{
			  			socket.emit('exitGroup',{id:item.group_id,room_id:item.room_id})
			  			_this.$store.commit('deleteMessage',{
			  				id:item.room_id
			  			})
			  			_this.$store.commit('deleteGroup',{
			  				id:item.group_id
			  			})
			        let message=_this.$store.getters.message.find(v=>v.room_id!=item.room_id)
			        _this.$emit('tapItem',{room_id:message&&message.room_id})
			  		})
          }
        })
        myMenu.append(deleteBtn)
      }
      myMenu.popup(this.$electron.remote.getCurrentWindow())
    },
    showEdit(room_id,name){
    	this.$store.commit('updateMessageOne',{
				id:room_id,
				data:{
					edit:true,
					tmpName:name
				}
		  })
    },
    hideEdit(room_id){
    	this.$store.commit('updateMessageOne',{
				id:room_id,
				data:{
					edit:false,
					tmpName:null
				}
		  })
    },
    changeName(item){
    	if(item.uid){
    		this.$ajax({
	  			method:'post',
	  			url:'changeUserNickname',
	  			data:{uid:item.uid,nickname:item.tmpName}
	  		}).then(res=>{
	  			this.$store.commit('updateMessageOne',{
	  				id:item.room_id,
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
	  			this.hideEdit(item.room_id)
	  		})
    	}else if(item.group_id){
    		this.$ajax({
	  			method:'post',
	  			url:'changeGroupname',
	  			data:{id:item.group_id,name:item.tmpName}
	  		}).then(res=>{
	  			socket.emit('changeGroupname',{id:item.group_id,name:item.tmpName})
	  			this.hideEdit(item.room_id)
	  		})
    	}
    }
  }
}
</script>

<style scoped>
.message li{
  padding: 8px;
  display: flex;
  line-height: 20px
}
.message li:hover{
  background: #f5f5f5;
}
.message li.active{
  background: #eee
}
.message .avatar{
  height: 40px;width: 40px;
}
.message .info{
  width: 136px;
  margin-left: 8px
}
.message .top{
  display: flex;
  justify-content: space-between;
}
.message .top h5{
  overflow: hidden;
  text-overflow: ellipsis;
  white-space:nowrap;
  color: #303133;
  font-size: 14px;
  font-weight: normal
}
.message .top span{
  color: #909399;
  flex: 0 0 auto;
}
.message p{
  color: #909399;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space:nowrap;
  height: 20px;
}
.message p>>>img{
  vertical-align: middle;
  height: 20px;width: 20px
}
.message .edit{
	margin-left: 8px;
	display: flex;
	align-items: center
}
.message .edit>>>input{
	padding: 0 5px
}
</style>
