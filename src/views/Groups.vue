<template>
  <div style="height: 83vh;padding-top: 45px;">
    <div class="subtitle row">
      <span class="col-8">Название подразделения</span>
      <span class="col-2" style="text-align: center;">Руководитель</span>
      <div class="pagination col-2">
        <nav>
          <ul class="pagination">
            <li class="page-item">
              <a class="page-link" @click="prevPage" aria-label="Previous" :class="{'block' : pageNumber==0}">
                <chevron-left-icon size="1.5x" class="custom-class" style="color: #5F5F5F;"></chevron-left-icon>
              </a>
            </li>
            <li class="page-item">
              <span v-if="pageNumber ==0">1-10</span>
              <span v-else>{{(10 * pageNumber)+1}}-{{(10 * pageNumber)+10}}</span>
            </li>
            <li class="page-item">
              <a class="page-link" @click="nextPage" aria-label="Next" :class="{'block' : pageNumber >= pageCount - 1}">
                <chevron-right-icon size="1.5x" class="custom-class" style="color: #5F5F5F;"></chevron-right-icon>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>


    <div class="container">
      <div id="accordion">
        <div class="card" id="card" v-for="(group, idx) in paginatedDataGroups" :key="idx">

          <div class="card-header row" id="heading" @click.self="event => clickOnCard(group.id, event)">
            <div class="name col-8">
              <h5 class="mb-0" style="height: 100%;">
                <button class="btn btn-link collapsed" data-toggle="collapse" :ref="'btn'+group.id"
                  :data-target="'#collapseOne'+group.id" @click="showOnClickUsers(group.id)" aria-expanded="false"
                  :aria-controls="'collapseOne'+group.id">
                  <chevron-up-icon size="1.5x" class="custom-class"></chevron-up-icon>
                </button>

                <div class="name_div" style="width: fit-content;">
                  <span :ref="'name-div'+group.id"
                    @click="event => {onClickInput(group.id, 'name',event)}">{{group.name}}</span>
                  <input class="form-control input-name" :id="'groupname'+group.id"
                    style="display: none;width: fit-content;" :ref="'group-name' + group.id"
                    @keyup.enter="event => {editGroupName(group.name, group.id, event)}" v-model="group.name"
                    @focus="event => onFocusInput(event, group.id, 'name')"
                    @blur="event => {onBlurInput(group.name, group.id, event, 'name')}">

                  <div class="hidden" :ref="'hidden'+group.id">
                    <button class="input-btn" @mousedown="event => {editGroupName(group.name, group.id, event)}">
                      <check-icon size="1x" class="custom-class"></check-icon>
                    </button>
                    <div @mousedown="event => onClear(event, group, 'name')">
                      <button class="input-btn" style="align-items: center;display: flex;">
                        <plus-icon size="1x" class="custom-class" id="closeIcon"></plus-icon>
                      </button>
                    </div>
                  </div>
                </div>
              </h5>
            </div>

            <div class="selectResponsible col-3">
              <ss-select v-model="group.leader_id" :options="allUsersReduced.filter(u => u.group_id == group.id)"
                track-by="name" search-by="surname" @change="selectExecutorGroup(group, $event)" disable-by="disabled"
                id="ss-select" style="width: fit-content;height: fit-content;">
                <div slot-scope="{ filteredOptions, selectedOption, isOpen, pointerIndex, $get, $selected, $disabled }"
                  @click="event => onClickExecutor(group.leader_id, event)" style="cursor: pointer; width: 100%;">
                  <ss-select-toggle class="flex justify-between" id="select-div"
                    style="width: 100%; padding: 2px 5px; align-items: center;">
                    <award-icon size="1.5x" class="custom-class"></award-icon>
                    {{ $get(selectedOption, 'name') || 
                  `${allUsersReduced.find(u => u.id == group.leader_id) ? allUsersReduced.find(u => u.id == group.leader_id).surname + ' ' 
                    + allUsersReduced.find(u => u.id == group.leader_id).name + ' ' 
                    + allUsersReduced.find(u => u.id == group.leader_id).father_name: 'Выбрать'}`}}
                    <chevron-down-icon size="1.5x" class="custom-class"></chevron-down-icon>
                  </ss-select-toggle>

                  <section v-show="isOpen && user.is_admin" class="absolute border-l border-r min-w-full">
                    <div class="px-px">
                      <ss-select-search-input class="w-full px-3 py-2 search" placeholder="Впишите фамилию">
                      </ss-select-search-input>
                    </div>
                    <ss-select-option v-for="(option, index) in filteredOptions" :value="option.id" :index="index"
                      data-toggle="modal" data-target="#groupConfirm" :key="index"
                      class="px-4 py-2 border-b cursor-pointer ss-select-option" :class="[
                                pointerIndex == index ? 'bg-light text-dark' : '',
                                $selected(option) ? 'bg-light text-dark' : '',
                                $disabled(option) ? 'opacity-50 cursor-not-allowed' : ''
                              ]">{{ option.surname }} {{ option.name }} {{ option.father_name }} </ss-select-option>
                  </section>
                </div>
              </ss-select>
            </div>
            <div style="width: 50px;height: 100%;" class="icons col-1">
              <button type="button" class="close" id="remove" data-toggle="modal" data-target="#groupDelete"
                v-show="user.is_admin" @click="deleteGroup(group)">
                <trash-icon size="1x" class="custom-class"></trash-icon>
              </button>
            </div>
          </div>


          <div :id="'collapseOne'+group.id" class="collapse" aria-labelledby="headingOne" data-parent="#accordion">
            <div class="card-body">
              <div class="card" v-show="user.is_admin">
                <div class="card-header" id="headingOneAdd">
                  <h5 class="mb-0">

                    <div>
                      <ss-select :options="usersNoGroup" track-by="name" search-by="surname" disable-by="disabled"
                        id="ss-select" style="width: fit-content;" @change="putUserToGroup(group.id, $event)">
                        <div
                          slot-scope="{ filteredOptions, selectedOption, isOpen, pointerIndex, $get, $selected, $disabled }"
                          style="cursor: pointer; width: 100%;">
                          <ss-select-toggle class="pl-1 pr-4 py-1 flex items-center justify-between"
                            style="width: 100%; padding: 13px;">
                            <user-icon size="1.5x" class="custom-class" id="iconUser"></user-icon>
                            <plus-icon size="1x" class="custom-class" id="plusIcon"></plus-icon>
                            {{ $get(selectedOption, 'name') || 'Добавить сотрудника'}}
                            <chevron-down-icon size="1.5x" class="custom-class"></chevron-down-icon>
                          </ss-select-toggle>

                          <section v-show="isOpen" class="absolute border-l border-r min-w-full"
                            style="top: 66%;left: 6%;">
                            <div class="px-px">
                              <ss-select-search-input class="w-full px-3 py-2 search" placeholder="Впишите фамилию">
                              </ss-select-search-input>
                            </div>
                            <ss-select-option v-for="(option, index) in filteredOptions" :value="option.id"
                              :index="index" :key="index" class="px-4 py-2 border-b cursor-pointer" :class="[
                                pointerIndex == index ? 'bg-light text-dark' : '',
                                $selected(option) ? 'bg-light text-dark' : '',
                                $disabled(option) ? 'opacity-50 cursor-not-allowed' : ''
                              ]">{{ option.surname }} {{ option.name }} {{option.father_name}} </ss-select-option>
                          </section>
                        </div>
                      </ss-select>
                    </div>
                  </h5>
                </div>

                <div id="collapseOneAdd" class="collapse" aria-labelledby="headingOneAdd" data-parent="#collapseOne">
                  <div class="card-body">
                    <input type="text">
                  </div>
                </div>
              </div>
              <ShowUsers v-if="openShowUsers && currentGroupId==group.id" :val="currentGroupId" />
            </div>
          </div>
        </div>
      </div>
    </div>


    <button v-show="user.is_admin" type="button" class="btn btnMain" @click="createG" data-toggle="modal"
      data-target="#groupCreate" style="margin: 37px auto 30px;">
      <plus-icon size="1.5x" class="custom-class" style="color: white; margin-right: 5px;"></plus-icon><span>Добавить
        подразделение</span>
    </button>


    <GroupCreate v-if="openCreateGroup" @createGroup="createGroup(param = $event)" />
    <GroupDelete v-if="openDeleteGroup" :val="paramsModal" @deleteGroup="deleteGroup(param = $event)" />

    <PopupConfirm v-if="openConfirm" :val="newLeader" @setNewLeader="setNewLeader(param = $event)"
      @undoChanges="undoChanges(param = $event)" />
  </div>
</template>

<script>
  import GroupCreate from '@/components/Groups/Create'
  import GroupDelete from '@/components/Groups/DeleteGroup'
  import PopupConfirm from '@/components/Groups/PopupConfirm'
  import ShowUsers from '@/components/Groups/Users/ShowUsers'

  import {
    mapGetters
  } from 'vuex'
  import {
    SsSelect,
    SsSelectToggle,
    SsSelectOption,
    SsSelectSearchInput
  } from 'ss-select'
  import {
    TrashIcon,
    PlusIcon,
    ChevronUpIcon,
    UserIcon,
    ChevronDownIcon,
    AwardIcon,
    CheckIcon,

    ChevronRightIcon,
    ChevronLeftIcon
  } from 'vue-feather-icons'

  export default {
    name: "Gropus",
    data: () => ({
      showDropdown: false,
      openDeleteGroup: false,
      openCreateGroup: false,
      openShowUsers: false,
      openConfirm: false,

      currentGroupName: '',
      currentGroupInput: '',
      currentExecutor: '',
      currentGroupId: '',

      arrowDown: true,

      paramsModal: {},
      newLeader: {},

      pageNumber: 0,
      size: 10,
    }),
    components: {
      GroupCreate,
      GroupDelete,
      ShowUsers,
      PopupConfirm,

      TrashIcon,
      ChevronRightIcon,
      ChevronLeftIcon,
      PlusIcon,
      CheckIcon,
      ChevronUpIcon,
      UserIcon,
      ChevronDownIcon,
      AwardIcon,

      SsSelect,
      SsSelectToggle,
      SsSelectOption,
      SsSelectSearchInput

    },
    async mounted() {
      await this.$store.dispatch('checkIsLeader')
      await this.$store.dispatch('getGroups')
      await this.$store.dispatch('getAllUsers')
    },
    computed: {
      ...mapGetters(['groups', 'error', 'error404', 'allUsers', 'members', 'usersNoGroup', 'allUsersReduced', 'user',
        'leader'
      ]),

      pageCount() {
        let l = this.groups.length,
          s = this.size;
        return Math.ceil(l / s);
      },
      paginatedDataGroups() {
        const start = this.pageNumber * this.size,
          end = start + this.size;
        return this.groups.slice(start, end);
      }
    },
    watch: {
      error404() {
        if (this.error404) {
          this.$toast.error(this.error404);
        }
      },
    },
    methods: {
      clickOnCard(id) {
        this.$refs['btn' + id][0].click()
      },

      onClickInput(id, type, event) {
        event.stopPropagation()
        if (this.user.is_admin) {
          event.target.style.display = 'none'
          this.$nextTick(() => {
            if (type == 'name') {
              this.$refs['group-name' + id][0].style.display = 'flex'
              this.$refs['group-name' + id][0].focus()
            } else {
              this.$refs['group-name-short' + id][0].style.display = 'flex'
              this.$refs['group-name-short' + id][0].focus()
            }
          })
        } else {
          this.$nextTick(() => {
            if (type == 'name') {
              this.$refs['group-name' + id][0].style.display = 'none'
            } else {
              this.$refs['group-name-short' + id][0].style.display = 'none'
            }
          })
        }

      },

      showOnClickUsers(id) {
        this.openShowUsers = true
        this.currentGroupId = id
      },
      createG() {
        this.openCreateGroup = true
        this.openDeleteGroup = false
        this.$store.commit('setError', '')
        document.getElementsByClassName('btn-link').forEach(element => {
          element.classList.contains('collapsed') ? '' : element.click()
        });
      },


      async onBlurInput(name, id) {
        this.$refs['group-name' + id][0].style.display = 'none'
        this.$refs['name-div' + id][0].style.display = 'initial'
        this.$refs['hidden' + id][0].classList.remove('flex')


        if (name !== this.currentGroupName) {
          this.$store.dispatch('editGroup', {
            id,
            name
          }).catch(() => {
            this.$store.commit('editGroup', {
              id,
              name: this.currentGroupName
            })
          })

        }
      },

      onFocusInput(event, id, type) {
        this.currentGroupName = event.target.value
        this.currentGroupInput = event.target

        type == 'name' ? this.$refs['hidden' + id][0].classList.add('flex') : this.$refs['hidden-short' + id][0]
          .classList.add('flex')
      },

      onClear(event, group, type) {
        event.preventDefault()
        event.stopPropagation()

        if (type === 'name' && group.name != this.currentGroupName) {
          this.$store.commit('editGroup', {
            name: this.currentGroupName,
            id: group.id
          })
        }

      },


      async editGroupName(name, id, event) {
        await this.$store.commit('setError404', '')
        event.target.blur()
      },

      deleteGroup(group) {
        this.openDeleteGroup = true
        this.openCreateGroup = false
        this.paramsModal = {
          group
        }
        document.getElementsByClassName('btn-link').forEach(element => {
          element.classList.contains('collapsed') ? '' : element.click()
        });
      },

      onClickExecutor(leader) {
        event.target.classList.contains('ss-select-option') ? '' : this.currentExecutor = leader
      },

      selectExecutorGroup(group, event) {
        this.openConfirm = true
        this.newLeader = {
          groupId: group.id,
          leader_id: event
        }
      },

      async setNewLeader(param) {
        await this.$store.commit('setError404', '')

        this.$store.dispatch('changeExecutorGroup', {
            id: param.groupId,
            uid: param.leader_id
          })
          .then(() => {
            this.$store.dispatch('getMembers', param.groupId)
            this.$store.dispatch('getLeader', param.groupId)
          })
          .catch(() => {
            this.$store.commit('editExecutorGroup', {
              id: param.groupId,
              leader_id: this.currentExecutor
            })
          })
      },

      async undoChanges(param) {
        await this.$store.commit('setError404', '')
        await this.$store.commit('editExecutorGroup', {
          id: param.groupId,
          leader_id: this.currentExecutor
        })
      },


      async putUserToGroup(groupId, uId) {
        await this.$store.commit('setError404', '')

        await this.$store.dispatch('putUserToGroup', {
          id: groupId,
          uid: uId
        }).then(() => {
          this.$store.dispatch('getAllUsers')
        })
      },


      nextPage() {
        document.getElementsByClassName('btn-link').forEach(element => {
          element.classList.contains('collapsed') ? '' : element.click()
        });
        this.pageNumber++;
      },
      prevPage() {
        document.getElementsByClassName('btn-link').forEach(element => {
          element.classList.contains('collapsed') ? '' : element.click()
        });
        if (this.pageNumber > 0) {
          this.pageNumber--;
        }
      },
    },

  }
</script>

<style scoped lang="scss">
  .col-8,
  .col-2,
  .col-3 {
    padding-left: 0;
    padding-right: 0;
  }

  h5 {
    .btn {
      padding-right: 16px;
      padding-left: 16px;
    }
  }

  .container {
    width: 95%;
    height: 75%;
    overflow-y: scroll;
    margin-top: 10px;
  }

  #accordion {
    width: inherit;
    margin: auto;
    height: 100%;
  }

  .name_div {
    font-family: 'GothamPro';
    font-size: 18px;
    line-height: 24px;
    letter-spacing: 0.15px;
    color: #000000;
    display: flex;
    height: fit-content;
    flex: 0 0 auto;
    width: auto;
    display: flex;
    align-items: center;

    span {
      flex: 0 0 auto;
      // width: 100%;
      width: fit-content;
    }
  }

  .name {
    padding-left: 0;
  }

  .form-control,
  #ss-select {
    height: 32px;
  }

  .input-btn {
    border: none;
    width: auto;
    height: 32px;
    margin-left: 8px;
    background-color: #F4F4F4;
    border-radius: 8px;

    svg {
      color: #4F4F4F;
      vertical-align: text-top;
    }
  }

  .hidden {
    visibility: hidden;
    display: flex;
    height: fit-content;
  }


  .flex {
    display: flex;
    visibility: visible;
  }

  #remove {
    display: none;
    margin: 0;
    justify-content: center;
  }

  #card:hover #remove {
    display: flex;
    width: 50px;
  }

  .subtitle {
    font-family: 'GothamPro';
    font-style: normal;
    font-weight: normal;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0.15px;
    color: #4F4F4F;
    display: flex;
    justify-content: space-between;
    padding-left: 68px;
    height: auto;
    margin: 0 auto 15px;
    width: 89%;
  }


  .card {
    border: none;
    margin-bottom: 16px;
  }

  .card-header {
    border: 2px solid #ECEBF4;
    border-radius: 9px;
    background-color: #fff;
    width: 100%;
    display: flex;
    min-height: 60px;
    height: fit-content;
    align-items: center;
  }

  .card-body {
    width: 84%;
    display: flex;
    flex-direction: column;
    background: #F6F7F9;
    border-radius: 0 0 9px 9px;
    margin: auto;
    padding-top: 0;
    margin-bottom: 10px;

    .card {
      width: 100%;
      background-color: transparent;
      padding-bottom: 14px;
      padding-top: 14px;
      border-bottom: 1px solid #DEDEDE;
      padding-left: 18px;
      height: fit-content;
      margin: 0;


      .collapse {
        width: 290px;
      }


      h5 {
        font-family: 'GothamPro-Medium';
        font-size: 16px;
        line-height: 24px;
        letter-spacing: 0.15px;
        color: #92D2C3;
      }

      .card-header {
        padding: 0;
        border: none;
        background-color: transparent;
        width: 349px;

        svg {
          color: #92D2C3;
        }

      }
    }
  }

  .search {
    outline: none;
    border: none;
    background-color: #F7F7F7;
    border-radius: 8px;
  }

  section {
    top: 100%;
    font-family: 'GothamPro';
  }

  .short-name,
  .selectResponsible {
    text-align: center;
  }

  .short-name {
    display: flex;
    justify-content: center;
  }

  .close {
    svg {
      color: #9b9b9b;
      cursor: pointer;
    }
  }

  #closeIcon {
    transform: rotate(45deg);
  }

  .input-name {
    cursor: pointer;
    background-color: #fff;
    border-radius: 8px;
    width: 100%;
    font-size: 18px;
    line-height: 24px;
  }

  .input-name:active,
  .input-name:focus {
    background-color: #F4F4F4;
  }

  ::-webkit-scrollbar {
    width: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background: #92D2C3;
    border-radius: 3px;
    height: 73px;
  }

  ::-webkit-scrollbar-track {
    background: #F2F2F2;
    border-left: 4px solid white;
    border-right: 4px solid white;
  }

  .selectResponsible {
    display: flex;
    padding-left: 10px;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0.15px;
    color: #828282;
    justify-content: center;

    #ss-select {
      align-items: center;
      display: flex;
      height: 36px;
      background-color: #fff;
      border-radius: 10px;
      text-align: center;
      width: fit-content;
      border-radius: 8px;
      justify-content: space-between;
      padding: 0;

      div {
        justify-content: space-between;
        display: flex;
      }
    }

    select {
      margin: 0;
      width: 142px;
      background-color: #f6f6f6;
    }

  }

  .selectResponsible {
    #ss-select:hover {
      background-color: #e5e9f1;
    }
  }

  .selectResponsible:focus,
  .selectResponsible:active {
    // color: #fff;

    #ss-select:focus,
    #ss-select:active {
      background-color: #4EAD96;
      color: #fff;

      svg {
        color: #fff !important;
      }
    }



  }

  #plusIcon {
    vertical-align: super;
    margin-right: 11px;
  }


  h2 {
    font-family: 'GothamPro-Medium';
    font-style: normal;
    font-weight: normal;
    font-size: 24px;
    line-height: 24px;
    letter-spacing: 0.15px;
    color: #4F4F4F;
    margin: 0 auto 59px;
  }

  .btn {
    padding: 0;
    border-radius: 12px;
    width: 302px;
    height: 58px;
    background: #92D2C3;
    color: #fff;
    margin: auto;

    font-size: 18px;
    line-height: 17px;

    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'GothamPro-Medium';
  }

  .btn-link {
    background-color: transparent;
    width: fit-content;
    height: fit-content;
    margin: 0;
  }

  .collapsed {
    transform: rotate(180deg);
    padding-left: 16px;
  }

  .icons {
    justify-content: flex-end;
  }


  .plus {
    margin-left: 0;
    margin-right: 9px;
  }

  h5 {
    display: flex;
    flex-direction: row;
  }

  .list-group-item {
    border-radius: 7px;
    width: 100%;
    height: fit-content;
    background-color: #F0F0F0;
    color: #717171;
    font-size: 18px;
    border: none;
    margin: 6.5px 0;
    justify-content: space-between;
    display: flex;
    align-items: center;
    padding: 0;
  }

  #list:hover .borderline {
    margin: initial;
    padding: 10px 26px;
  }

  .toggle-area {
    width: 100%;
    cursor: pointer;
    padding: 23px 0 23px 23px;
  }

  svg {
    color: #AFAFAF;
    cursor: pointer;
  }

  .icons {
    display: flex;
  }

  .pagination {
    align-items: center;
    justify-content: flex-end;
    margin-bottom: 0;
    padding: 0;
  }

  .page-link {
    background: none;
    border: none;
    color: #5F5F5F;
    margin: 0;
  }

  .block {
    color: #D3D3D3;
    opacity: 0.5;
    pointer-events: none;
    cursor: default;
  }

  .page-link img {
    margin: 0;
  }

  .page-item {
    font-style: normal;
    font-weight: normal;
    color: #5F5F5F;
  }

  .page-item a {
    padding: 0;
    margin: 0 15px;
  }

  .borderline {
    margin: -2px 0;
    padding: 10px 26px;
    border-right: 1px solid #e0e0e0;
    border-left: 1px solid #e0e0e0;
  }


  @media (max-width: 1500px) {
    .page-item a {
      margin: 0 9px;
    }

    #headingOneAdd {
      height: auto;
    }


    h2 {
      font-size: 20px;
    }

    .subtitle {
      padding-left: 0;
      align-items: center;
    }

    .selectResponsible #ss-select div {
      width: 100%;
    }

    #remove {
      align-self: center;

      svg {
        font-size: 20px !important;
      }
    }

    .input-btn {
      height: 25px;
      align-self: flex-start;

      svg {
        vertical-align: middle;
      }
    }
  }

  @media (min-width: 1400px) {

    .container,
    .subtitle {
      max-width: 1350px;
    }

    h2 {
      max-width: 1270px;
    }
  }

  @media (max-width: 1200px) {
    .btnMain {
      width: 200px;
    }
  }

  @media (min-width: 500px) {
    h2 {
      width: 64%;
    }

    // .subtitle {
    //   padding-left: 68px !important;
    // }
  }

  .col-3 {
    padding: 0px;
  }
</style>