import Vue from 'vue'
import {
  Button, Form, FormItem,
  Input, Message, Container, Header, Aside, Main,
  Menu, Submenu, MenuItem, Breadcrumb,
  BreadcrumbItem, Card, Row, Col, Table,
  TableColumn, Switch, Tooltip, Pagination, Dialog,
  Tag, Tree, Select, Option, Cascader, Alert, Tabs, Checkbox, CheckboxGroup
  , TabPane, Steps, Step, Upload, Timeline, TimelineItem
  , MessageBox
} from 'element-ui'

Vue.use(Button)
Vue.use(Timeline)
Vue.use(TimelineItem)
Vue.use(Upload)
Vue.use(Checkbox)
Vue.use(CheckboxGroup)
Vue.use(Step)
Vue.use(Steps)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(MenuItem)
Vue.use(Submenu)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Col)
Vue.use(Row)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)
Vue.use(Tag)
Vue.use(Tree)
Vue.use(Alert)
Vue.use(Select)
Vue.use(Option)
Vue.use(Cascader)

// 全局挂载
Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm
