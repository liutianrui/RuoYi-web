<template>
  <d2-container :class="{ 'page-compact': crud.pageOptions.compact }">
    <template slot="header">数据集页面</template>
    <d2-crud-x ref="d2Crud" v-bind="_crudProps" v-on="_crudListeners">
      <!-- 自动绑定参数与事件 -->
      <!-- 包含详细参数见：https://gitee.com/greper/d2-crud-plus/blob/master/packages/d2-crud-plus/src/lib/mixins/crud.js#L164-->
      <div slot="header">
        <crud-search
          ref="search"
          :options="crud.searchOptions"
          @submit="handleSearch"
        />
        <el-button-group>
          <el-button size="small" type="primary" @click="addRow"
          ><i class="el-icon-plus"/> 新增
          </el-button
          >
        </el-button-group>
        <!-- 导入-->
        <el-upload
          style="float: left"
          class="upload-demo"
          ref="upload"
          :action="baseURL"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :before-remove="beforeRemove"
          :on-success='successUpload'
          :on-error='errorUpload'
          :before-upload='beforeUpload'
          :limit="1"
          accept=".csv"
          :on-exceed="handleExceed"
          :auto-upload="false"
          :file-list="fileList">
          <el-button size="small" type="primary">选择文件</el-button>
          <div slot="tip" class="el-upload__tip">只能上传csv文件</div>
        </el-upload>
        <el-button style="margin-left: 10px;float: left" size="small" type="success" @click="submitUpload">上传</el-button>
        <el-button  style="margin-left: 10px;float: left" size="small" type="warning" @click="jsonDownload">下载预测结果文件</el-button>
        <crud-toolbar v-bind="_crudToolbarProps" v-on="_crudToolbarListeners"/>
      </div>
    </d2-crud-x>
  </d2-container>
</template>

<script>
import { crudOptions } from './crud' // 上文的crudOptions配置
import { d2CrudPlus } from 'd2-crud-plus'
import { AddObj, GetList, UpdateObj, DelObj, Download } from './api' // 查询添加修改删除的http请求接口
import { Loading } from 'element-ui';

export default {
  name: 'dataSet',
  mixins: [d2CrudPlus.crud], // 最核心部分，继承d2CrudPlus.crud
  data() {
    return {
      baseURL:'http://127.0.0.1:8000/api/system/file/', // 文件上传路径
      macro_F1: null,
      macro_P: null,
      macro_R: null,
      fileList: [],
      LABEL0: '',
      LABEL1: '',
      LABEL2: '',
      LABEL3: '',
      LABEL4: '',
      LABEL5: '',
      precision_i:[],
      recall_i:[],
      isloading:'', //遮罩层控制
      isShowJson:'' //json下载控制
    }
  },
  methods: {
    getCrudOptions () {
      return crudOptions(this)
    },
    pageRequest (query) {
      return GetList(query)
    }, // 数据请求
    addRequest (row) {
      return AddObj(row)
    }, // 添加请求
    updateRequest (row) {
      return UpdateObj(row)
    }, // 修改请求
    delRequest (row) {
      return DelObj(row.id)
    }, // 删除请求
    downloadRequest () {
      return Download()
    }, // 下载请求
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePreview(file) {
      console.log(file);
    },
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`);
    },
    beforeUpload(file, fileList) {
      Loading.service({ fullscreen: true, text: '文件分析中，请耐心等待...' });// 打开遮罩层
    },
    /**
     * 上传成功的函数
     */
    successUpload(response, file, fileList) {
      console.log('上传成功', response, file, fileList);
      if (response.status == 200) {
        // 图形参数赋值
        this.label0 = response.data.LABEL0
        this.label1 = response.data.LABEL1
        this.label2 = response.data.LABEL2
        this.label3 = response.data.LABEL3
        this.label4 = response.data.LABEL4
        this.label5 = response.data.LABEL5
        this.macro_F1 = response.data.macro_F1
        this.macro_P = response.data.macro_P
        this.macro_R = response.data.macro_R
        this.precision_i = response.data.precision_i
        this.recall_i = response.data.recall_i

        this.$nextTick(options => { // 以服务的方式调用的 Loading 需要异步关闭
          Loading.service(options).close()
        });
        // 图形展示
        // this.drawPie()
        // this.drawBar1()
        // this.drawBar2()
        // 预测结果可下载
        this.isShowJson = true
      }
      this.$message({
        message: '分析成功',
        type: 'success'
      });
    },
    // 上传失败
    errorUpload(response, file, fileList) {
      this.$message.error('上传失败！');
      this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
        Loading.service().close()
      });
    },
    async submitUpload() {
      if (this.$refs.upload.uploadFiles.length == 0){ // 判断是否有文件
        this.$message('请先上传文件')
        return
      }
      this.$refs.upload.submit();
    },
    // 预测结果json下载
    async jsonDownload(){
      this.downloadRequest().then((response) => {
        const blob = new Blob([response]);
        const elink = document.createElement('a');
        elink.download = '预测结果.json';
        elink.style.display = 'none';
        elink.href = URL.createObjectURL(blob);
        document.body.appendChild(elink);
        elink.click();
        URL.revokeObjectURL(elink.href); // 释放URL 对象
        document.body.removeChild(elink);
      })
    }
  }
}
</script>
