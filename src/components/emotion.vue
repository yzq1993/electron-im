<template>
  <el-card class="emotionBox">
  	<img :src="require('../images/emoji/emoji_'+item+'.png')" v-for="item in 45" @click=tapImg(item)>
  </el-card>
</template>

<script>
export default {
  data(){
    return {

    }
  },
  created(){},
  methods:{
  	tapImg(item){
  		this.$emit('tap',item)
  	}
  }
}
</script>

<style scoped>
.emotionBox{
	position: absolute;top: -200px;left: 50%;
	margin-left: -165px;
	display: flex;
	flex-wrap: wrap;
}
.emotionBox>>>.el-card__body{
	padding: 5px;
	width: 330px;
}
.emotionBox img{
	margin: 5px;
	height: 22px;width: 22px;
	cursor: pointer
}
</style>
