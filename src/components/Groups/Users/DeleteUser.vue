<template>
  <div class="popup-delete">
    <div class="modal fade" id="groupDeleteUser" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Вы точно хотите удалить пользователя из подразделения?</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <button type="submit" class="btn btn-secondary yes" data-dismiss="modal" @click="removeUserFromGroup()">Да</button>
            <button type="reset" class="btn btn-secondary" data-dismiss="modal">Нет</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'

  export default {
    name: 'popup',
    props: ['val'],
    data: () => ({
      name: ''
    }),
    computed: {
      ...mapGetters(['error', 'error404', 'allUsers', 'usersNoGroup']),
    },
    methods: {
      async removeUserFromGroup() {
        await this.$store.commit('setError404', '')
        this.$store.dispatch('removeUserFromGroup', {
          id: this.val.id,
          uid: this.val.uid
        })
        this.$store.dispatch('getAllUsers')
        this.allUsers.find(u => u.id == this.val.uid).group_id = null
      },
    }
  }
</script>

<style scoped>

  .modal-content {
    border-radius: 12px;
    border: none;
    width: 487px;
    padding: 30px 87px 25px;
    line-height: 24px;
  }

  .modal-title {
    font-family: 'Roboto';
    font-weight: 500;
    font-size: 18px;
    line-height: 24px;
    letter-spacing: 0.15px;
    color: #2D453F;
        width: 100%;
    text-align: center;
  }

  #new-problem-title {
    border: none;
    border-bottom: 2px solid #92D2C3;
    border-radius: 6px;
    background-color: #FAFAFA;
    color: #CDCDCD;
    margin: 0 10px;
  }

  .modal-header {
    border: none;
    padding: 0 0 32px 0;
  }

  .modal-body {
    display: flex;
    justify-content: space-between;
    padding: 0;
  }

  .btn {
    background-color: #F5F5F5;
    border: none;
    color: #000;
    width: fit-content;
    padding: 5px 27px;
    font-size: 18px;
    line-height: 24px;
    letter-spacing: 0.15px;
    font-family: 'GothamPro';
    color: #000000;
  }

  .close {
    margin-right: -83px;
    margin-top: -34px;
    font-weight: normal;
    color: #2D453F;
    opacity: 1;
  }

  @media (min-width: 576px) {
    .modal-dialog {
      max-width: 487px;
      margin: 1.75rem auto;
    }
  }
</style>