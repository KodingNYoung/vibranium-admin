$(function () {
  // instantiation of modal
  const dialogs = document.querySelectorAll('.mdc-dialog');
  const dialogInstances = {}
  dialogs.forEach(dialog => {
    const modalId = dialog.dataset.modalId;
    dialogInstances[modalId] = new mdc.dialog.MDCDialog(dialog);
  })

  window.__DSCAuthPromise = new Promise(function (resolve) {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        console.log('[DSC:Firebase:Auth]', 'Sucessfully signed in user')
        if (location.href.endsWith('login.html')) {
          location.href = location.href.slice(0, location.href.indexOf('login.html'))
        } else {
          $('#userEmailDisplay').text(user.email);
          resolve(user);
        }
      } else {
        // No user is signed in.
        console.log('[DSC:Firebase:Auth]', 'Sucessfully signed out user')
        if (!location.href.endsWith('login.html')) {
          location.href = location.href.slice(0, location.href.lastIndexOf('/')) + '/login.html'
        }
      }
    });
  })
  $('#loginForm').on('submit', function (event) {
    event.preventDefault();

    const loginBtn = $('.login-button');
    const dialogMessage = $('#my-dialog-content');

    // disable button and change the text
    loginBtn.attr('disabled', true);
    loginBtn.text('please wait...');

    var email = $('#inputEmail').val();
    var password =  $('#inputPassword').val();

    firebase.auth().signInWithEmailAndPassword(email, password)
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log('[DSC:Firebase:Auth:Error:' + errorCode + ']', 'Failed to authenticate because ' + errorMessage);
        var shownErrorMessage;
        if (errorCode === 'auth/user-not-found') {
          shownErrorMessage = 'No user with that email was found'
        } else if (errorCode === 'auth/network-request-failed') {
          shownErrorMessage = 'Network error, please check your internet connection'
        } else if (errorCode === 'auth/wrong-password') {
          shownErrorMessage = 'The provided password is invalid'
        } else {
          shownErrorMessage = 'An unknown error occured (Code ' + errorCode + ')'
        }

        // update dialog message
        dialogMessage.text(shownErrorMessage);
        // show error message
        dialogInstances["error-message"].open();

        //enable button and change the text back
        loginBtn.attr('disabled', false);
        loginBtn.text('login');
      });
  });
  $('#logoutButton').on('click', function (event) {
    event.preventDefault()
    $('#errorAlert').hide()
    firebase.auth().signOut().catch(function (error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log('[DSC:Firebase:Auth:Error:' + errorCode + ']', 'Failed to signout because ' + errorMessage);
      $('#errorAlert').text(errorMessage);
      $('#errorAlert').show();
    })
  })
});