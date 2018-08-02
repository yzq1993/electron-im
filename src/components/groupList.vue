<template>
  <div class="groupList">
   	<div class="searchBar">
      <el-input placeholder="搜索" v-model="group.search"></el-input>
      <i class="el-icon-plus" @click="group.addShow=true"></i>
    </div>
    <ul v-if="$store.getters.group.length&&!group.search||group.search&&$store.getters.group.find(v=>v.name.indexOf(group.search)>-1)">
      <li v-for="item in $store.getters.group" @dblclick=tapGroup(item) @contextmenu=handlerGroup(item)
        v-if="!group.search||item.name.indexOf(group.search)>-1" >
        <img :src=item.avatar>
        <p v-if="!item.edit">{{item.name}}</p>
        <div class="edit" v-else>
          <el-input v-model="item.tmpName" size="mini" @blur=hideEdit(item.id) @keyup.native.enter=changeName(item)></el-input>
        </div>
      </li>
    </ul>
    <p v-else class="kong">暂无数据</p>
    <addGroup v-model="group.addShow" v-if="group.addShow"></addGroup>
  </div>
</template>

<script>
import socket from '@/assets/socket'
import addGroup from '@/components/addGroup'
export default {
  data(){
    return {
    	group:{
    		search:null,
    		addShow:false
    	}
    }
  },
  created(){},
  components:{addGroup},
  methods:{
  	tapGroup(item){
      let data=this.$store.getters.message.find(v=>v.group_id==item.id)
      this.$emit('tapItem',data)
    },
    handlerGroup(item){
      if(item.edit){return false}
      let MenuItem = this.$electron.remote.MenuItem,
        Menu = this.$electron.remote.Menu,
        myMenu = new Menu(),
        _this=this
      let sendBtn=new MenuItem({
        label: '发送消息',
        click(){
          _this.tapGroup(item)
        }
      })
      myMenu.append(sendBtn)
      let editBtn=new MenuItem({
        label:'修改群名',
        click(){
          _this.showEdit(item.id,item.name)
        } 
      })
      myMenu.append(editBtn)
      let deleteBtn=new MenuItem({
        label: '退出群组',
        click(){
          _this.$ajax({
		  			method:'post',
		  			url:'exitGroup',
		  			data:{id:item.id,room_id:item.room_id}
		  		}).then(res=>{
		  			socket.emit('exitGroup',{id:item.id,room_id:item.room_id})
		  			_this.$store.commit('deleteMessage',{
		  				id:item.room_id
		  			})
		  			_this.$store.commit('deleteGroup',{
		  				id:item.id
		  			})
		        let message=_this.$store.getters.message.find(v=>v.room_id!=item.room_id)
		        _this.$emit('tapItem',{room_id:message&&message.room_id})
		  		})
        }
      })
      myMenu.append(deleteBtn)
      myMenu.popup(this.$electron.remote.getCurrentWindow())
    },
    showEdit(id,name){
      this.$store.commit('updateGroupOne',{
        id,
        data:{
          edit:true,
          tmpName:name
        }
      })
    },
    hideEdit(id){
      this.$store.commit('updateGroupOne',{
        id,
        data:{
          edit:false,
          tmpName:null
        }
      })
    },
    changeName(item){
      this.$ajax({
        method:'post',
        url:'changeGroupname',
        data:{id:item.id,name:item.tmpName}
      }).then(res=>{
        socket.emit('changeGroupname',{id:item.id,name:item.tmpName})
        this.hideEdit(item.id)
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
.groupList li{
  padding: 8px;
  display: flex;
  line-height: 20px
}
.groupList li{
  display: flex;
  border-bottom: 1px solid #d8d8d8
}
.groupList li:nth-child(1){
  border-top: 1px solid #d8d8d8
}
.groupList img{
  height: 40px;width: 40px;
  margin-right: 8px
}
.groupList p{
	user-select:none;
  line-height: 40px;
  width: 136px;
  color: #303133;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis
}
.groupList .edit{
  margin-left: 8px;
  display: flex;
  align-items: center
}
.groupList .edit>>>input{
  padding: 0 5px
}
.groupList .kong{
  text-align: center;
  line-height: 30px;
  color: #909399;
  width: 100%;
}
</style>
