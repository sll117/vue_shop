<template>
  <div>
    <!--    面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--  卡片视图-->
    <el-card>
      <!--      添加角色按钮区-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleVisible=true">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="roleList" border stripe>
        <!--        展开列-->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom',i1===0?'bdtop':'','vcenter']" v-for="(item1,i1) in scope.row.children"
                    :key="item1.id">
              <!--渲染一级权限-->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row,item1.id)">{{ item1.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>

              <!--渲染二级和三级权限-->
              <el-col :span="19">
                <!--                渲染二级权限-->
                <el-row :class="[i2===0?'':'bdtop','vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success"
                            closable
                            @close="removeRightById(scope.row,item2.id)">
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag v-for="(item3) in item2.children"
                            :key="item3.id" type="warning"
                            closable
                            @close="removeRightById(scope.row,item3.id)">
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!--        索引列-->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit"
                       @click="showEditDialog(scope.row.id)">编辑
            </el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete"
            @click="removeRolesById(scope.row.id)">删除</el-button>
            <el-button size="mini" type="warning"
                       icon="el-icon-setting"
                       @click="showSetRightDialog(scope.row)">分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="defKeys=[]">
      <!-- 树形组件
      show-checkbox:显示复选框
      node-key:设置选中节点对应的值
      default-expand-all:是否默认展开所有节点
      :default-checked-keys 设置默认选中项的数组
      ref:设置引用 -->
      <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all
               :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
    </span>
    </el-dialog>

    <!--    添加角色对话框-->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleVisible"
      width="50%"
      @close="addRolesClosed"
    >
      <!--      内容主体-->
      <el-form :model="addForm" ref="addFormRef" label-width="70px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!--      底部-->
      <span slot="footer">
    <el-button @click="addRoleVisible = false">取 消</el-button>
    <el-button type="primary" @click="addRoles">确 定</el-button>
  </span>
    </el-dialog>

    <!--编辑角色对话框-->
    <el-dialog
      title="编辑角色"
      :visible.sync="editRoleVisible"
      width="50%"
      @close="editRolesClosed"
    >
      <!--      内容主体-->
      <el-form :model="editForm" ref="editFormRef" label-width="70px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!--      底部-->
      <span slot="footer">
    <el-button @click="editRoleVisible = false">取 消</el-button>
    <el-button type="primary" @click="editRoles">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  data () {
    return {
      // 所有角色的列表数据
      roleList: [],
      // 分配权限对话框
      setRightDialogVisible: false,
      // 所有权限的数据
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的结点id值
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: '',

      // 添加角色对话框的显示控制
      addRoleVisible: false,

      // 编辑角色对话框的显示控制
      editRoleVisible: false,

      // 添加角色表单
      addForm: {
        roleName: '',
        roleDesc: ''
      },

      // 编辑角色表单
      editForm: {}
    }
  },
  created () {
    this.getRoleList()
  },

  methods: {
    async getRoleList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.roleList = res.data
    },

    // 根据id删除对应权限
    async removeRightById (role, rightId) {
      // 弹框提示用户是否要删除
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 确认删除，返回值为confirm字符串
      // 取消删除，返回cancel字符串
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除操作')
      } else {
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除权限失败！')
        }
        this.$message.success('删除权限成功！')
        // 返回的data, 是当前角色下最新的权限数据
        // 所以只要将其权限更新即可
        role.children = res.data
      }
    },

    // 展示分配权限的对话框
    async showSetRightDialog (role) {
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree ')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败')
      }
      // 把获取到的权限，赋值给rightsList
      this.rightsList = res.data

      // 递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys)

      this.setRightDialogVisible = true
    },

    // 递归获取角色下的所有三级权限，并保存到数组中
    getLeafKeys (node, arr) {
      // 如果当前node节点不包含children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }

      node.children.forEach(item =>
        this.getLeafKeys(item, arr))
    },

    // 点击为角色分配权限
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`,
        {
          rids: idStr
        })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      await this.getRoleList()
      this.setRightDialogVisible = false
    },

    // 添加角色
    addRoles () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加失败！')
        }
        this.$message.success('添加成功！')
        // 隐藏添加用户的对话框
        this.addRoleVisible = false
        // 重新获取用户列表
        await this.getRoleList()
      })
    },
    // 关闭添加角色对话框，将其表单内容清空
    addRolesClosed () {
      this.$refs.addFormRef.resetFields()
    },

    // 展示编辑角色的对话框
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色信息失败！')
      }

      this.editForm = res.data
      this.editRoleVisible = true
    },
    // 编辑角色
    editRoles () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写完整的用户信息')
        const { data: res } = await this.$http.put('roles/' + this.editForm.roleId, {
          roleName: this.editForm.roleName,
          roleDesc: this.editForm.roleDesc

        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改失败！')
        }
        this.$message.success('修改成功！')
        // 隐藏添加用户的对话框
        this.editRoleVisible = false
        // 重新获取用户列表
        await this.getRoleList()
      })
    },
    // 关闭编辑角色对话框，将其表单内容清空
    editRolesClosed () {
      this.$refs.editFormRef.resetFields()
    },

    // 根据id删除特定角色
    async removeRolesById (id) {
      // 弹框询问用户是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 确认删除，返回值为confirm字符串
      // 取消删除，返回cancel字符串
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除操作')
      } else {
        const { data: res } = await this.$http.delete('roles/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除失败！')
        }
        this.$message.success('删除成功！')
        // 重新获取用户列表
        await this.getRoleList()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}

</style>
