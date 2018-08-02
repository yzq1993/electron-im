<template>
  <el-dialog title="加入群聊" :visible.sync="value" width="600px" center :before-close="close">
    <el-transfer v-model="data" :data="friendList"  :props="{ key: 'uid',  label: 'name' }"
     filterable :filter-method="filterMethod" :titles="['我的好友', '已选好友']" class="transfer"
      @left-check-change=leftChange @right-check-change=rightChange>
    	<div slot-scope="{option}" class="user_item">
    		<img :src="option.avatar">
    		<p>{{option.nickname||option.name}}</p>
   		</div>
    </el-transfer>
    <span slot="footer">
	    <el-button @click=close>取 消</el-button>
	    <el-button type="primary" @click=sure>确 定</el-button>
	  </span>
  </el-dialog>
</template>

<script>
import socket from '@/assets/socket'
export default {
  data(){
    return {
      user:null,
      friendList:[],
      data:[],
      groupUser:[]
    }
  },
  props:{
    value:{
      type:Boolean,
      default:false
    },
    group_id:String
  },
  async created(){
  	this.friendList=await this.$ajax({url:'/friend'})
    if(this.group_id){
      this.$ajax({
        url:'/group',
        params:{group_id:this.group_id}
      }).then(res=>{
        this.data=res.userList.map(v=>v.uid)
        this.groupUser=res.userList.map(v=>v.uid)
      })
    }
  },
  methods:{
  	close(){
  		this.$emit('input',false)
  	},
    leftChange(a,b){
      this.data.push(...b)
    },
    rightChange(a,b){
      if(this.groupUser.find(v=>v==b[0])){return false}
      let index=this.data.findIndex(v=>v==b[0])
      this.data.splice(index,1)
    },
  	sure(){
  		if(!this.data.length){
  			this.$error('请选择加入群组的好友')
  			return false
  		}
      if(!this.group_id){
        this.$ajax({
          method:'post',
          url:'/addGroup',
          data:{uid:this.data}
        }).then(res=>{
          this.close()
          socket.emit('addGroup',{time:res.time,room_id:res.room_id,group_id:res.group_id,uid:this.data})
        })
      }else{
        let uid=this.data.filter(v=>!this.groupUser.find(m=>m==v))
        this.$ajax({
          method:'post',
          url:'/joinGroup',
          data:{uid,group_id:this.group_id}
        }).then(res=>{
          socket.emit('joinGroup',{time:res.time,room_id:res.room_id,group_id:res.group_id,uid})
          this.close()
        })
      }
  	},
  	filterMethod(query, item) {
      return item.name.indexOf(query) > -1||item.nickname.indexOf(query) > -1;
    }
  }
}
</script>

<style scoped>
	.transfer>>>.el-checkbox__input{
		display: none
	}
  .transfer>>>.el-checkbox__label{
    padding-left: 0
  }
  .transfer>>>.el-checkbox__label span{
    display: none
  }
  .transfer>>>.el-transfer-panel{
    margin: 0 35px;
  }
	.transfer>>>.el-transfer-panel__item{
		height: 50px;
		line-height: 50px
	}
	.transfer>>>.el-transfer-panel__item .el-checkbox__input{
		top: 12px;
	}
  .transfer>>>.el-transfer__buttons{
    display: none
  }
	.user_item{
		display: flex;
	}
	.user_item img{
		height: 40px;width: 40px;
		margin-right: 5px
	}
	.user_item p{
		color: #333;
		line-height: 40px
	}
</style>
