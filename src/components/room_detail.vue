<template>
  <div class="room_detail scrollbar">
  	<div v-if="user.uid" class="user_detail">
  		<el-form label-width="60px" label-position="left">
				<el-form-item label-width="0" class="avatar">
					<img :src="user.avatar">
				</el-form-item>
				<el-form-item label="昵称">
					<span>{{user.name}}</span>
				</el-form-item>
				<el-form-item label="备注">
					<div v-if="!edit"><span>{{user.nickname}}</span><i class="el-icon-edit" @click="edit=true"></i></div>
					<div v-else>
						<el-input v-model="user.nickname" size="mini" @keyup.native.enter.prevent=changeUserNickname @blur=changeUserNickname></el-input>
					</div>
				</el-form-item>
				<el-form-item label="邮箱">
					<span>{{user.email}}</span>
				</el-form-item>
				<el-form-item label="手机号">
					<span>{{user.phone}}</span>
				</el-form-item>
				<el-form-item label="性别">
					<span>{{user.sex}}</span>
				</el-form-item>
				<el-form-item label="生日">
					<span>{{user.birth}}</span>
				</el-form-item>
				<el-form-item label="学校">
					<span>{{user.school}}</span>
				</el-form-item>
				<el-form-item label="所在地">
					<span>{{user.address}}</span>
				</el-form-item>
				<el-form-item label="家乡">
					<span>{{user.hometown}}</span>
				</el-form-item>
				<el-form-item label="公司">
					<span>{{user.company}}</span>
				</el-form-item>
				<el-form-item label="签名">
					<span>{{user.summary}}</span>
				</el-form-item>
				<el-form-item label-width="0" class="delete">
					<el-button type="danger" @click=deleteFriend>删除好友</el-button>
				</el-form-item>
			</el-form>
  	</div>
  	<div v-else class="group_detail">
  		<el-form label-width="60px" label-position="left">
				<el-form-item label-width="0" class="avatar">
					<div class="avatarBox">
						<img :src="group.avatar">
						<input type="file" name="" @change=changeGroupAvatar accept="image/png,image/jpg,image/jpeg,image/gif">
					</div>
				</el-form-item>
				<el-form-item label="群名">
					<div v-if="!edit"><span>{{group.name}}</span><i class="el-icon-edit" @click="edit=true"></i></div>
					<div v-else>
						<el-input v-model="group.name" size="mini" @keyup.native.enter.prevent=changeGroupname @blur.native=changeGroupname></el-input>
					</div>
				</el-form-item>
				<el-form-item label="群成员">
					<ul class="member">
						<li @click="addGroupShow=true">
							<i class="el-icon-plus"></i>
							<p>添加</p>
						</li>
						<li v-for="item in group.userList">
							<img :src=item.avatar @click=tapUser(item.uid,$event)>
							<p>{{item.name}}</p>
						</li>
					</ul>
				</el-form-item>
				<el-form-item label-width="0" class="delete">
					<el-button type="danger" @click=exitGroup>退出</el-button>
				</el-form-item>
			</el-form>
			<addGroup v-model="addGroupShow" v-if="addGroupShow" :group_id=group.id></addGroup>
  	</div>
  </div>
</template>
<script>
import socket from '@/assets/socket'
import addGroup from '@/components/addGroup'
export default {
  data(){
    return {
    	edit:false,
    	addGroupShow:false,
    	user:{

    	},
    	group:{

    	}
    }
  },
  props:['room_id'],
  components:{addGroup},
  created(){
  	let row=this.$store.getters.message.find(v=>v.room_id==this.room_id)
  	if(row.uid){
  		this.getUser(row.uid)
  	}else{
  		this.getGroup(row.group_id)
  	}
  },
  methods:{
  	getUser(uid){
  		this.$ajax({
  			url:'/user',
  			params:{uid}
  		}).then(res=>{
  			this.user=res
  		})
  	},
  	getGroup(group_id){
  		this.$ajax({
  			url:'/group',
  			params:{group_id}
  		}).then(res=>{
  			this.group=res
  		})
  	},
  	tapUser(uid,event){
  		this.$store.commit('updateUser',{
        uid:uid,
        show:true,
        left:event.pageX,
        top:event.pageY
      })
  	},
  	changeUserNickname(){
  		this.$ajax({
  			method:'post',
  			url:'changeUserNickname',
  			data:{uid:this.user.uid,nickname:this.user.nickname}
  		}).then(res=>{
  			this.edit=false
  			this.$store.commit('updateMessageOne',{
  				id:this.room_id,
  				data:{
  					nickname:this.user.nickname
  				}
  			})
  			this.$store.commit('updateFriendOne',{
  				uid:this.user.uid,
  				data:{
  					nickname:this.user.nickname
  				}
  			})
  		})
  	},
  	deleteFriend(){
  		this.$ajax({
  			method:'post',
  			url:'deleteFriend',
  			data:{uid:this.user.uid,room_id:this.room_id}
  		}).then(res=>{
  			socket.emit('deleteFriend',{uid:this.user.uid,room_id:this.room_id})
  		})
  	},
  	changeGroupname(){
  		this.$ajax({
  			method:'post',
  			url:'changeGroupname',
  			data:{id:this.group.id,name:this.group.name}
  		}).then(res=>{
  			this.edit=false
  			socket.emit('changeGroupname',{id:this.group.id,name:this.group.name})
  		})
  	},
   	changeGroupAvatar(event){
  		let file=event.target.files[0],
        formData=new FormData();
      formData.append('file',file);
      this.$ajax({
      	method:'post',
        url:'/upload',
        data:formData
      }).then(res=>{
      	this.$ajax({
	      	method:'post',
	        url:'/changeGroupAvatar',
	        data:{id:this.group.id,avatar:res.url}
	      }).then(_=>{
	      	this.group.avatar=res.url
	      	socket.emit('changeGroupAvatar',{id:this.group.id,avatar:res.url})
	      })
      })
  	},
  	exitGroup(){
  		this.$ajax({
  			method:'post',
  			url:'exitGroup',
  			data:{id:this.group.id,room_id:this.room_id}
  		}).then(res=>{
  			socket.emit('exitGroup',{id:this.group.id,room_id:this.room_id})
  			this.$store.commit('deleteMessage',{
  				id:this.room_id
  			})
  			this.$store.commit('deleteGroup',{
  				id:this.group.id
  			})
        let message=this.$store.getters.message.find(v=>v.room_id!=res.room_id)
        this.$emit('tapItem',{room_id:message&&message.room_id})
  		})
  	}
  }
}
</script>

<style scoped>
.room_detail{
	flex-shrink: 0;
	width: 280px;
	padding: 15px;
	border-left: 1px solid #d8d8d8;

}
.room_detail .el-icon-edit{
	cursor: pointer;
	margin-left: 8px
}
.avatar{
	margin: 20px 0
}
.avatar img{
	height: 80px;width: 80px;
}
.avatar>>>.el-form-item__content{
	display: flex;
	justify-content: center
}
.avatarBox{
	height: 80px;width: 80px;
	position: relative;
}
.avatarBox input{
	position: absolute;top: 0;left: 0;
	height: 100%;width: 100%;
	font-size: 0;
	cursor: pointer;
	opacity: 0;
}
.room_detail input{
	padding: 0 8px
}
.delete{
	text-align: center;
	margin-top: 15px
}
.el-form-item{
	margin-bottom: 0
}
.member{
	list-style: none;
	display: flex;
	flex-wrap: wrap
}
.member li:not(:nth-child(4n)){
	margin-right: 8px;
	margin-bottom: 8px
}
.member img{
	height: 40px;width: 40px;
	display: block;
	cursor: pointer
}
.member i{
	height: 40px;width: 40px;
	display: flex;
	justify-content: center;
	align-items: center;
	border: 1px solid #d8d8d8;
	cursor: pointer;
	font-size: 20px
}
.member p{
	line-height: 20px;
	height: 20px;
	color: #333;
	text-align: center;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis
}
</style>
