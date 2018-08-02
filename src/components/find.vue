<template>
  <el-dialog title="添加朋友" :visible.sync="value" width="500px" center :before-close="close">
    <el-input placeholder="请输入手机号/邮箱/昵称" v-model="user" @keyup.native.enter=search>
      <el-button slot="append" icon="el-icon-search" @click=search></el-button>
    </el-input>
    <ul class="user_list scrollbar">
      <li v-for="item in list">
        <img class="avatar" :src=item.avatar :alt=item.name>
        <div class="info">
          <h5>{{item.name}}</h5>
          <p>{{item.address}}</p>
          <p>{{item.summary}}</p>
        </div>
        <el-button type="primary" @click=apply(item.uid)>添加好友</el-button>
      </li>
    </ul>
  </el-dialog>
</template>

<script>
import socket from '@/assets/socket'
  export default {
    data(){
      return {
        user:null,
        list:[]
      }
    },
    props:{
      value:{
        type:Boolean,
        default:false
      }
    },
    created(){
    	
    },
    methods:{
      close(){
        this.$emit('input',false)
        this.user=null
        this.list=[]
      },
      search(){
        if(!this.user){return false}
        this.$ajax({
          method:'post',
          url:'/searchUser',
          data:{search:this.user}
        }).then(res=>{
          this.list=res
        })
      },
      apply(uid){
        this.$ajax({
          method:'post',
          url:'/applyFriend',
          data:{uid}
        }).then(res=>{
          socket.emit('applyFriend',uid)
          this.$success('申请成功')
          setTimeout(_=>{
            this.close()
          },500)
        })
      }
    }
  }
</script>
<style scoped>
  .user_list{
    display: flex;
    flex-wrap: wrap;
    max-height: 450px;
    margin-top: 10px;
  }
  .user_list li{
    position: relative;
    display: flex;
    padding: 8px;
    width: 219px;height: 135px;
    margin-right: 8px;
    margin-bottom: 10px;
    border: 1px solid #dcdfe6;
  }
  .user_list li:nth-child(2n){
    margin-right:0
  }
  .user_list .avatar{
    height: 40px;width: 40px;
    border-radius: 4px
  }
  .user_list .info{
    margin-left: 8px;
    line-height: 20px;
  }
  .user_list h5{
    font-size: 16px;
    font-weight: normal
  }
  .user_list p{
    font-size: 14px;
    overflow:hidden;
    display:-webkit-box;
     -webkit-line-clamp:2;
    -webkit-box-orient:vertical;
  }
  .user_list .el-button{
    width: 90px;height: 30px;
    padding: 0;
    position: absolute;bottom: 8px;right: 8px
  }
</style>
