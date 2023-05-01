<template>
  <d2-container :class="{ 'page-compact': crud.pageOptions.compact }">
    <template slot="header">数据集分析</template>
    <div slot="header">
      <br>
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
        accept=".csv"
        :on-exceed="handleExceed"
        :auto-upload="false"
        :file-list="fileList">
        <el-button size="small" type="primary">选择文件</el-button>
        <div slot="tip" class="el-upload__tip">只能上传csv文件</div>
      </el-upload>
      <el-button style="margin-left: 10px;float: left" size="small" type="success" @click="submitUpload">上传</el-button>
      <el-button v-if="isShowJson" style="margin-left: 10px;float: left" size="small" type="warning"
                 @click="jsonDownload">下载预测结果文件
      </el-button>

      <div v-if="macro_F1" style="float:left;margin: auto">
        <h2>预测结果:</h2>
        <h3>macro_F1: {{ macro_F1 * 100 }}%</h3>
        <h3>macro_P: {{ macro_P * 100 }}%</h3>
        <h3>macro_R: {{ macro_R * 100 }}%</h3>
      </div>
    </div>
    <br>
    <br>
    <!--  Echarts 图形 start  -->
    <div style="float: left" id="pieChart" :style="{width: '450px', height: '450px'}"></div>
    <div style="float: left" id="bar1Chart" :style="{width: '400px', height: '400px'}"></div>
    <div style="float: left" id="bar2Chart" :style="{width: '400px', height: '400px'}"></div>
  </d2-container>
</template>

<script>
import { crudOptions } from './crud' // 上文的crudOptions配置
import { d2CrudPlus } from 'd2-crud-plus'
import { AddObj, GetList, UpdateObj, DelObj, Download } from './api' // 查询添加修改删除的http请求接口
import { Loading } from 'element-ui'
import util from '@/libs/util'
export default {
  name: 'curd_demo',
  mixins: [d2CrudPlus.crud], // 最核心部分，继承d2CrudPlus.crud
  data () {
    return {
      baseURL: util.baseURL() + 'api/system/file/', // 文件上传路径
      macro_F1: null,
      macro_P: null,
      macro_R: null,
      fileList: [],
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
    downloadRequest () {
      return Download()
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
        this.macro_F1 = analysisResult.macro_F1
        this.macro_P = analysisResult.macro_P
        this.macro_R = analysisResult.macro_R
        this.precision_i = analysisResult.precision_i
        this.recall_i = analysisResult.recall_i

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
      if (this.$refs.upload.uploadFiles.length == 0) { // 判断是否有文件
        this.$message('请先上传文件')
        return
      }
      this.$refs.upload.submit()
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
            type: 'bar'
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
            type: 'bar'
          }
        ]
      })
    },
  }
}
</script>
