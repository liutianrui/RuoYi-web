<template>
  <d2-container :class="{ 'page-compact': crud.pageOptions.compact }">
    <template slot="header">数据集分析</template>
    <div slot="header">
      <br>
      <el-button style="margin-left: 10px;float: left" size="small" type="danger" plain @click="trainDataSet"><i
        class="el-icon-edit"/>模型训练
      </el-button>
      <el-button style="margin-left: 10px;float: left" size="small" type="success" plain @click="model_download"><i
        class="el-icon-download"/>下载模型
      </el-button>
      <!-- 导入 -->
      <el-upload
        style="float: left"
        class="upload-demo"
        ref="upload"
        :action="baseURL"
        :headers="uploadHeaders"
        :on-preview="handlePreview"
        :on-remove="handleRemove"
        :before-remove="beforeRemove"
        :on-success='successUpload'
        :on-error='errorUpload'
        :before-upload='beforeUpload'
        limit="1"
        accept=".csv"
        :on-exceed="handleExceed"
        :auto-upload="false"
        :file-list="fileList">
        <el-button style="margin-left: 10px;" size="small" type="primary" slot="trigger" plain><i class="el-icon-document-add"/>选择文件</el-button>
        <!--        <div slot="tip" class="el-upload__tip">只能上传csv文件</div>-->
        <el-button style="margin-left: 10px;" size="small" type="success"  plain @click="submitUpload(false)"><i
          class="el-icon-upload el-icon--right"/>上传分析
        </el-button>
      </el-upload>
      <el-button v-if="isShowJson" style="margin-left: 10px;float: left" size="small" type="warning" plain
                 @click="jsonDownload"><i class="el-icon-download"/>下载预测结果
      </el-button>
      <div v-if="macro_F1" style="float:left;padding-left:100px;margin: auto">
        <h2>预测结果:</h2>
        <h2>macro_F1: {{ macro_F1 }}%</h2>
        <h2>macro_P: {{ macro_P }}%</h2>
        <h2>macro_R: {{ macro_R }}%</h2>
      </div>
    </div>
    <br>
    <br>
    <!--  Echarts 图形 start  -->
    <div style="float: left" id="pieChart" :style="{width: '450px', height: '450px'}"></div>
    <div style="float: left" id="bar1Chart" :style="{width: '400px', height: '400px'}"></div>
    <div style="float: left" id="bar2Chart" :style="{width: '400px', height: '400px'}"></div>
    <!--模型训练-->
    <el-dialog
      title="模型训练"
      :visible.sync="dialogVisible"
      width="30%"
      :show-close = "false"
      :before-close="handleClose">
      <el-result icon="warning" title="提示" subTitle="训练时间耗时较长">
        <template slot="extra">
<!--          <el-button type="primary" size="medium">返回</el-button>-->
        </template>
      </el-result>
      <el-upload
        style="float: left"
        class="upload-demo"
        ref="upload_train"
        :action="trainDataSetURL"
        :headers="uploadHeaders"
        :on-preview="handlePreview"
        :on-remove="handleRemove"
        :before-remove="beforeRemove"
        :on-success='successUploadTrain'
        :on-error='errorUpload'
        :before-upload='beforeUpload'
        :limit=1
        accept=".csv"
        :on-exceed="handleExceed"
        :auto-upload="false"
        :file-list="fileList_train">
        <el-button style="margin-left: 10px;" size="small" type="primary" slot="trigger">选择模型</el-button>
                <div slot="tip" class="el-upload__tip">只能上传csv文件</div>
        <el-button style="margin-left: 10px;" size="small" type="danger"  @click="submitUploadTrain(false)">训练
        </el-button>
      </el-upload>
      <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">关 闭</el-button>
<!--    <el-button type="primary" @click="dialogVisible = false">确 定</el-button>-->
  </span>
    </el-dialog>
  </d2-container>
</template>

<script>
import { crudOptions } from './crud' // 上文的crudOptions配置
import { d2CrudPlus } from 'd2-crud-plus'
import { AddObj, GetList, UpdateObj, DelObj, Download, model_download, trainDataSet } from './api' // 查询添加修改删除的http请求接口
import { Loading } from 'element-ui'
import util from '@/libs/util'

export default {
  name: 'curd_demo',
  mixins: [d2CrudPlus.crud], // 最核心部分，继承d2CrudPlus.crud
  data () {
    return {
      baseURL: util.baseURL() + 'api/system/file/', // 文件上传路径
      trainDataSetURL: util.baseURL() + 'api/dataset/trainDataSet/', // 模型训练路径
      uploadHeaders: {
        Authorization: 'JWT ' + util.cookies.get('token')
      },
      dialogVisible: false,
      macro_F1: null,
      macro_P: null,
      macro_R: null,
      fileList: [],
      fileList_train: [],
      label0: '',
      label1: '',
      label2: '',
      label3: '',
      label4: '',
      label5: '',
      precision_i: [],
      recall_i: [],
      isloading: '', //遮罩层控制
      isShowJson: '' //json下载控制
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
    downloadRequest () { // json下载
      return Download()
    },
    model_downloadRequest () { // j模型下载
      return model_download()
    },
    trainDataSetRequest () {
      return trainDataSet()
    }, // 下载请求
    handleRemove (file, fileList) {
      console.log(file, fileList)
    },
    handlePreview (file) {
      console.log(file)
    },
    handleExceed (files, fileList) {
      this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
    },
    beforeRemove (file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`)
    },
    beforeUpload (file, fileList) {
      Loading.service({
        fullscreen: true,
        text: '文件分析中，请耐心等待...'
      })// 打开遮罩层
    },
    /**
     * 上传成功的函数
     */
    successUpload (response, file, fileList) {
      this.$nextTick(options => { // 以服务的方式调用的 Loading 需要异步关闭
        Loading.service(options).close()
      })
      console.log('上传成功', response, file, fileList)
      if (response.code == 2000) {
        // // 图形参数赋值
        let analysisResult = JSON.parse(response.data.dict) // 字符串转对象

        this.label0 = analysisResult.LABEL0
        this.label1 = analysisResult.LABEL1
        this.label2 = analysisResult.LABEL2
        this.label3 = analysisResult.LABEL3
        this.label4 = analysisResult.LABEL4
        this.label5 = analysisResult.LABEL5
        this.macro_F1 = Number(analysisResult.macro_F1 * 100).toFixed(2)
        this.macro_P = Number(analysisResult.macro_P * 100).toFixed(2)
        this.macro_R = Number(analysisResult.macro_R * 100).toFixed(2)
        this.precision_i = analysisResult.precision_i
        this.recall_i = analysisResult.recall_i
        // 四舍五入 保留两位小数
        for (let i = 0; i < this.precision_i.length; i++){
          this.precision_i[i] = this.precision_i[i].toFixed(2)
          this.recall_i[i] = this.recall_i[i].toFixed(2)
        }
        // 图形展示
        this.drawPie()
        this.drawBar1()
        this.drawBar2()
        // 预测结果可下载
        this.isShowJson = true
      }
      this.$message({
        message: '分析成功',
        type: 'success'
      })
    },
    // 上传失败
    errorUpload (response, file, fileList) {
      this.$message.error('上传失败！')
      this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
        Loading.service().close()
      })
    },
    async submitUpload () {
      // if (this.$refs.upload.uploadFiles.length == 0) { // 判断是否有文件
      //   this.$message('请先上传文件')
      //   return
      // }
      this.$refs.upload.submit()
    },
    // 模型训练
    trainDataSet () {
      this.$confirm('训练模型预计需要30分钟，耗时较长, 确定训练吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.dialogVisible = true

      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消训练'
        })
      })
    },
    // 下载模型
    async model_download () {
      this.model_downloadRequest().then((response) => {
        const blob = new Blob([response], { type: 'application/zip' })
        const elink = document.createElement('a')
        elink.download = '模型文件.zip'
        elink.style.display = 'none'
        elink.href = URL.createObjectURL(blob)
        document.body.appendChild(elink)
        elink.click()
        URL.revokeObjectURL(elink.href) // 释放URL 对象
        document.body.removeChild(elink)
      })
    },
    // 预测结果json下载
    async jsonDownload () {
      this.downloadRequest().then((response) => {
        const blob = new Blob([response])
        const elink = document.createElement('a')
        elink.download = '预测结果.json'
        elink.style.display = 'none'
        elink.href = URL.createObjectURL(blob)
        document.body.appendChild(elink)
        elink.click()
        URL.revokeObjectURL(elink.href) // 释放URL 对象
        document.body.removeChild(elink)
      })
    },
    successUploadTrain (response, file, fileList) {
      this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
        Loading.service().close()
      })
      this.dialogVisible = false
      this.$message({
        message: '模型训练完毕，请上传测试集',
        type: 'success'
      })
    },
    async submitUploadTrain () {
      if (this.$refs.upload_train._data.uploadFiles.length == 0){
        this.$message({
          type: 'warning',
          message: '请先上传模型！'
        })
        return
      }
      this.$refs.upload_train.submit()
      Loading.service({
        fullscreen: true,
        text: '训练模型中，耗时较长，请耐心等待...'
      })// 打开遮罩层
      // this.trainDataSetRequest().then((response) => {
      //   this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
      //     Loading.service().close()
      //   })
      //   this.$message({
      //     message: '模型训练完毕，请上传测试集',
      //     type: 'success'
      //   })
      // })
    },
    handleClose(done) {
      // this.$confirm('确认关闭？')
      //   .then(_ => {
      //     done();
      //   })
      //   .catch(_ => {});
    },
    //饼图初始化
    drawPie () {
      // 基于准备好的dom，初始化echarts实例
      var pieChart = this.$echarts.init(document.getElementById('pieChart'))
      // 绘制图表
      pieChart.setOption({
        title: {
          text: 'label类别占比',
          // subtext: 'Fake Data',
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: 'Access From',
            type: 'pie',
            radius: '50%',
            data: [
              {
                value: this.label0,
                name: 'label0'
              },
              {
                value: this.label1,
                name: 'label1'
              },
              {
                value: this.label2,
                name: 'label2'
              },
              {
                value: this.label3,
                name: 'label3'
              },
              {
                value: this.label4,
                name: 'label4'
              },
              {
                value: this.label5,
                name: 'label5'
              }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      })
    },
    //柱状图1初始化
    drawBar1 () {
      // 基于准备好的dom，初始化echarts实例
      var bar1Chart = this.$echarts.init(document.getElementById('bar1Chart'))
      // 绘制图表
      bar1Chart.setOption({
        title: {
          text: 'precision_i数据',
        },
        xAxis: {
          type: 'category',
          data: ['label0', 'label1', 'label2', 'label3', 'label4', 'label5']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: [
              {
                value: this.precision_i[0],
                itemStyle: {
                  color: '#587dd7'
                }
              },
              {
                value: this.precision_i[1],
                itemStyle: {
                  color: '#8ecc79'
                }
              },
              {
                value: this.precision_i[2],
                itemStyle: {
                  color: '#fdc65f'
                }
              },
              {
                value: this.precision_i[3],
                itemStyle: {
                  color: '#f36366'
                }
              },
              {
                value: this.precision_i[4],
                itemStyle: {
                  color: '#6cc1dd'
                }
              },
              {
                value: this.precision_i[5],
                itemStyle: {
                  color: '#2fa274'
                }
              },
            ],
            // data: this.precision_i,
            type: 'bar',
            itemStyle: {
              normal: {
                label: {
                  show: true, //开启显示数值
                  position: 'top', //数值在上方显示
                  textStyle: {  //数值样式
                    // color: '#D1DBFF',   //字体颜色
                    fontSize: 14  //字体大小
                  }
                }
              }
            }
          }
        ]
      })
    },
    //柱状图2初始化
    drawBar2 () {
      // 基于准备好的dom，初始化echarts实例
      var bar2Chart = this.$echarts.init(document.getElementById('bar2Chart'))
      // 绘制图表
      bar2Chart.setOption({
        title: {
          text: 'recall_i数据',
        },
        xAxis: {
          type: 'category',
          data: ['label0', 'label1', 'label2', 'label3', 'label4', 'label5']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: [
              {
                value: this.recall_i[0],
                itemStyle: {
                  color: '#587dd7'
                }
              },
              {
                value: this.recall_i[1],
                itemStyle: {
                  color: '#8ecc79'
                }
              },
              {
                value: this.recall_i[2],
                itemStyle: {
                  color: '#fdc65f'
                }
              },
              {
                value: this.recall_i[3],
                itemStyle: {
                  color: '#f36366'
                }
              },
              {
                value: this.recall_i[4],
                itemStyle: {
                  color: '#6cc1dd'
                }
              },
              {
                value: this.recall_i[5],
                itemStyle: {
                  color: '#2fa274'
                }
              },
            ],
            // data: this.precision_i,
            type: 'bar',
            itemStyle: {
              normal: {
                label: {
                  show: true, //开启显示数值
                  position: 'top', //数值在上方显示
                  textStyle: {  //数值样式
                    // color: '#D1DBFF',   //字体颜色
                    fontSize: 14  //字体大小
                  }
                }
              }
            }
          }
        ]
      })
    },
  }
}
</script>
