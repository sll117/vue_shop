<template>
  <div>
    <!--    面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--    卡片视图区-->
    <el-card>
      <!--头部警告区-->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        show-icon
        :closable="false">
      </el-alert>

      <!--选择商品分类区域-->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!--          选择商品的级联选择框-->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>

      <!--tab页签区域-->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!--      添加动态参数的面板-->
        <el-tab-pane label="动态参数" name="many">
          <!--添加参数按钮-->
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加参数
          </el-button>
          <!--动态参数表格-->
          <el-table :data="manyTableData" border stripe>
            <!--展开列-->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag closable v-for="(item,index) in scope.row.attr_vals"
                        :key="index" @close="handleClose(index,scope.row)">
                  {{ item }}
                </el-tag>

                <!--输入的文本框-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!--                添加的按钮-->
                <el-button v-else class="button-new-tag"
                           size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <!--索引列-->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="openEditDialog(scope.row.attr_id)">
                  编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini"
                           @click="removeParamsById (scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!--添加静态属性的面板-->
        <el-tab-pane label="静态属性" name="only">
          <!--添加属性按钮-->
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加属性
          </el-button>
          <!--静态属性表格-->
          <el-table :data="onlyTableData" border stripe>
            <!--展开列-->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag closable v-for="(item,index) in scope.row.attr_vals"
                        :key="index" @close="handleClose(index,scope.row)">
                  {{ item }}
                </el-tag>

                <!--输入的文本框-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!--                添加的按钮-->
                <el-button v-else class="button-new-tag"
                           size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <!--索引列-->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini"
                           @click="openEditDialog(scope.row.attr_id)">
                  编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini"
                           @click="removeParamsById (scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

        </el-tab-pane>
      </el-tabs>

      <!--      添加参数对话框-->
      <el-dialog
        :title="'添加'+titleText"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed">
        <el-form :model="addForm" :rules="addFormRules"
                 ref="addFormRef" label-width="100px"
        >
          <!--        添加分类表单-->
          <el-form-item :label="titleText+':'" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>

        </el-form>
        <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addParams">确 定</el-button>
  </span>
      </el-dialog>

      <!--      编辑参数对话框-->
      <el-dialog
        :title="'编辑'+titleText"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed">
        <el-form :model="editForm" :rules="addFormRules"
                 ref="editFormRef" label-width="100px"
        >
          <!--        添加分类表单-->
          <el-form-item :label="titleText+':'" prop="attr_name">
            <el-input v-model="editForm.attr_name" clearable></el-input>
          </el-form-item>

        </el-form>
        <span slot="footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editParams">确 定</el-button>
  </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Params',
  data () {
    return {
      // 商品分类列表
      cateList: [],
      // 指定级联选择器的配置对象
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框双向绑定到的数组
      selectedCateKeys: [],
      // 被激活的页签名称
      activeName: 'many',
      // 动态参数的数据
      manyTableData: [],
      // 静态属性的数据
      onlyTableData: [],
      // 添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      // 控制添加参数对话框的显示
      addDialogVisible: false,

      // 添加参数的验证规则对象
      addFormRules: {
        attr_name: [{
          required: true,
          message: '请输入参数名',
          trigger: 'blur'
        }]
      },

      // 控制编辑参数对话框的显示
      editDialogVisible: false,

      // 编辑参数的表单数据对象
      editForm: {
        attr_name: ''
      }
    }
  },
  created () {
    this.getCateList()
  },
  computed: {
    // 如果按钮需要被禁用，则返回true，否则返回false
    isBtnDisabled () {
      return this.selectedCateKeys.length !== 3
    },
    // 当前选中的三级分类的id
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    titleText () {
      return this.activeName === 'many' ? '动态参数' : '静态属性'
    }
  },
  methods: {
    // 获取商品分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }

      this.cateList = res.data
      console.log(this.cateList)
    },
    // 获取参数的列表数据
    async getParamsData () {
      // 选中的不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
      }
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`,
        {
          params:
            { sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('请求动态参数失败')
      }

      // 将以空格为间隔的字符串转变成数组形式
      res.data.forEach(item => {
        // 如果attr_val为空，返回空数组即可
        item.attr_vals = item.attr_vals === '' ? [] : item.attr_vals.split(' ')
        // 添加布尔值，控制文本框显示
        item.inputVisible = false
        // 文本框中输入的值
        item.inputValue = ''
      })
      console.log(res.data)

      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 级联选择框选中项变化，会触发该函数
    handleChange () {
      this.getParamsData()
    },
    // tab页签点击事件的处理函数
    handleTabClick () {
      this.getParamsData()
    },
    // 添加动态参数对话框关闭，将内容清空
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },

    // 添加参数
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/
        ${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          return this.$message.error('添加失败！')
        }
        this.$message.success('添加成功！')
        // 隐藏添加用户的对话框
        this.addDialogVisible = false
        // 重新获取用户列表
        await this.getParamsData()
      })
    },

    // 打开编辑参数对话框的操作
    async openEditDialog (id) {
      const { data: res } = await
      this.$http.get(`categories/${this.cateId}/attributes/${id}`, {
        params: {
          attr_sel: this.activeName
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败！')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 关闭编辑参数对话框
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },

    // 编辑参数提交
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          })
        if (res.meta.status !== 200) {
          return this.$message.error('修改分类失败')
        }
        this.$message.success('修改分类成功')
        this.editDialogVisible = false
        await this.getParamsData()
      })
    },

    // 根据id删除对应参数
    async removeParamsById (id) {
      // 弹框询问用户是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 确认删除，返回值为confirm字符串
      // 取消删除，返回cancel字符串
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除操作')
      } else {
        const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除失败！')
        }
        this.$message.success('删除成功！')

        await this.getParamsData()
      }
    },

    // 文本框失去焦点，或摁下enter键触发
    async handleInputConfirm (row) {
      // 用户未输入内容
      if (row.inputValue.trim().length === 0) {
        row.inputVisible = false
        row.inputValue = ''
        return
      }
      // 用户输入了有效内容,将其添加到attr_vals数组尾部
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      await this.saveAttrValues(row)
    },
    // 将对attr_vals的操作保存到数据库中
    async saveAttrValues (row) {
      // 将操作保存到后台
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        })
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败')
      }
      this.$message.success('修改参数项成功')
    },
    // 点击按钮，展示文本输入框
    showInput (row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      // $nextTick方法作用：当页面上元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除对应参数下的可选项
    handleClose (index, row) {
      row.attr_vals.splice(index, 1)
      this.saveAttrValues(row)
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}

.el-tag {
  margin: 10px
}

.input-new-tag {
  width: 120px;
}
</style>
