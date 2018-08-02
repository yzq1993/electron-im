<template>
	<div class="user_info" @click=close @contextmenu=close>
		<div class="user_info_box" :style="{top:top+'px',left:left+'px',}" @click.stop ref="main">
			<el-form label-width="60px" label-position="left">
				<el-form-item label-width="0">
					<img :src="user.avatar"><p>{{user.name}}</p>
					<template v-if="user.uid">
						<el-button type="primary" v-if="user.my" @click=edit>编 辑</el-button>
						<el-button type="primary" v-else-if="user.status==0" @click=sendMessage>发送消息</el-button>
						<el-button type="primary" v-else-if="user.status==2" disabled>已申请</el-button>
						<el-button type="primary" v-else-if="user.status==3" @click=receiveFriend>接受申请</el-button>
						<el-button type="primary" v-else @click=applyFriend>添加好友</el-button>
					</template>
				</el-form-item>
				<el-form-item label="备注">
					<span>{{user.nickname}}</span>
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
			</el-form>
		</div>
	</div>
</template>

<script>
import socket from '@/assets/socket'
export default {
  data(){
    return {
    	userEdit:false,
    	user:{
    		uid:null,
				name:null,
				nickname:null,
				avatar:null,
				email:null,
				phone:null,
				summary:null,
				sex:null,
				birth:null,
				school:null,
				hometown:null,
				address:null,
				company:null,
				status:null,
				my:null
    	},
    	top:null,
    	left:null
    }
  },
  created(){
  	this.getUser(this.$store.state.user.uid)
		this.$nextTick(_=>{
  		this.setPosition()
  	})
  },
  methods:{
  	setPosition(){
			let top=this.$store.state.user.top,
  			bodyH=document.body.clientHeight,
  			height = this.$refs.main.clientHeight
  		if(top+height<bodyH){
  			this.top=top
  		}else if(top+height>bodyH&&top-height>0){
  			this.top=top-height
  		}else{
  			this.top=top-height/2
  		}
  		let left=this.$store.state.user.left,
  			bodyW=document.body.clientWidth,
  			width = this.$refs.main.clientWidth
  		if(left+width>bodyW){
  			this.left=left-width
  		}else{
  			this.left=left
  		}
  	},
  	close(){
  		this.$store.commit('updateUser',{show:false})
  	},
  	getUser(uid){
  		this.$ajax({
  			url:'/user',
  			params:{uid}
  		}).then(res=>{
  			this.user=res
  		})
  	},
  	edit(){
  		this.close()
  		this.$emit('showEdit')
  	},
  	applyFriend(){
  		this.$ajax({
        method:'post',
        url:'/applyFriend',
        data:{uid:this.user.uid}
      }).then(res=>{
        socket.emit('applyFriend',this.user.uid)
        this.$success('申请成功')
        this.close()
      })
  	},
  	receiveFriend(){
      this.$ajax({
        url:'/receiveFriend',
        method:'post',
        data:{uid:this.user.uid}
      }).then(res=>{
      	this.close()
        socket.emit('receiveFriend',this.user.uid)
      })
    },
    sendMessage(){
    	let data=this.$store.getters.message.find(v=>v.uid==this.user.uid)
      if(data){
        this.$emit('tapItem',data)
        this.close()
      }else{
        this.$ajax({
          url:'/insertRoom',
          method:'post',
          data:{uid:this.user.uid}
        }).then(res=>{
          let list=this.$store.getters.message
          list.unshift({
          	room_id:res.room_id,
          	avatar:this.user.avatar,
          	name:this.user.name,
          	nickname:this.user.nickname,
          	time:res.time,
          	uid:this.user.uid
          })
          this.$store.commit('updateMessage',list)
          this.$emit('tapItem',{room_id:res.room_id})
          socket.emit('insertRoom',{uid:this.user.uid,room_id:res.room_id,time:res.time})
          socket.emit('joinRoom',res.room_id)
          this.close()
        })
      }
    }
  }
}
</script>

<style scoped>
	.user_info{
		position: fixed;top: 0;left: 0;
		height: 100%;width: 100%;
		z-index: 10
	}
	.user_info_box{
		position: absolute;
		background: #fff;
		box-shadow: 0 2px 4px 0 rgba(0,0,0,.12), 0 0 6px 0 rgba(0,0,0,.04);
		width: 300px;
		padding: 20px;
		z-index: 100
	}
	.el-form img{
		height: 40px;width: 40px;
		margin-right: 20px
	}
	.el-form p{
		flex: 1 0 auto;
		margin-right: 10px;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis
	}
	.el-form-item:nth-child(1)>>>.el-form-item__content{
		display: flex;
	}
	.el-form-item{
		margin-bottom: 0
	}
</style>
