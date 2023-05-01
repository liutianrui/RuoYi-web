import { request } from "@/api/service";
import { BUTTON_STATUS_NUMBER } from "@/config/button";
import { urlPrefix as bookPrefix } from "./api";


export const crudOptions = vm => {
  return {
    pageOptions: {
      compact: true
    },
    options: {
      tableType: "vxe-table",
      rowKey: true, // 必须设置，true or false
      rowId: "id",
      height: "100%", // 表格高度100%, 使用toolbar必须设置
      highlightCurrentRow: false
    },
    rowHandle: {
      width: 140,
      view: {
        thin: true,
        text: "",
        disabled() {
          return !vm.hasPermissions("Retrieve");
        }
      },
      edit: {
        thin: true,
        text: "",
        disabled() {
          return !vm.hasPermissions("Update");
        }
      },
      remove: {
        thin: true,
        text: "",
        disabled() {
          return !vm.hasPermissions("Delete");
        }
      }
    },
    indexRow: {
      // 或者直接传true,不显示title，不居中
      title: "序号",
      align: "center",
      width: 100
    },
    viewOptions: {
      componentType: "form"
    },
    formOptions: {
      defaultSpan: 24, // 默认的表单 span
      width: "35%"
    },
    columns: [{
      title: "ID",
      key: "id",
      show: false,
      disabled: true,
      width: 90,
      form: {
        disabled: true
      }
    },
      {
        title: "sample_id",
        key: "sample_id",
        search: {
          // component: {
          //   props: {
          //     clearable: true
          //   }
          // }
        },
        sortable: true,
        treeNode: true,

        type: "input",
        form: {
          editDisabled: true,
          rules: [
            // 表单校验规则
            { required: true, message: "sample_id必填" }
          ],
          component: {
            props: {
              clearable: true
            },
            placeholder: "请输入sample_id"
          },
          itemProps: {
            class: { yxtInput: true }
          }
        }
      },
      {
        title: "feature0",
        key: "feature0",
        sortable: true,
        type: "text",
        form: {
          editDisabled: true,
          rules: [
            // 表单校验规则
            { required: false, message: "库存量必填" }
          ],
          component: {
            props: {
              clearable: true
            },
            placeholder: "请输入feature0"
          },
          itemProps: {
            class: { yxtInput: true }
          }
        }
      },
      {
        title: "feature1",
        key: "feature1",
        // sortable: true,

        type: "text",
        form: {
          editDisabled: true,
          // rules: [
          //   // 表单校验规则
          //   { required: true, message: "商品定价必填" }
          // ],
          component: {
            props: {
              clearable: true
            },
            placeholder: "请输入feature1"
          },
          itemProps: {
            class: { yxtInput: true }
          }
        }
      },
      {
        title: "feature2",
        key: "feature2",
        sortable: false,
        type: "text",
        form: {
          // rules: [
          //   { required: true, message: "进货时间必填" }
          // ],
          component: {
            props: {
              clearable: true,
              // format: 'yyyy-MM-dd',
              // valueFormat: 'yyyy-MM-dd'
            },
            placeholder: "请输入feature2"
          },
          itemProps: {
            class: { yxtInput: true }
          }
        }
      },
      {
        title: "label",
        key: "label",
        sortable: false,
        search: {
        },
        type: "text",
        form: {
          component: {
            props: {
              clearable: true,
            },
            placeholder: "请输入label"
          },
          itemProps: {
            class: { yxtInput: true }
          }
        }
      },
    // //  上传文件
    //   {
    //     title: '选择数据',
    //     key: 'algorithmData',
    //     valueResolve(row, key) {
    //       if (row.algorithmData.length > 0) {
    //         row.algorithmData = row.algorithmData[0]
    //       }
    //
    //     },
    //     sortable: true,
    //     search: {
    //       disabled: true
    //     },
    //     type: 'file-uploader',
    //
    //     form: {
    //       props: { //表单组件的参数，具体参数请查看对应的组件文档
    //         drag: true
    //       },
    //
    //       valueChange(key, value, form, { getColumn, mode, component, immediate, getComponent }) {
    //         // form表单数据change事件，表单值有改动将触发此事件
    //         console.log(form[key]);
    //       },
    //     }
    //   },
    ].concat(vm.commonEndColumns())
  };
};
