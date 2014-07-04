function clearForm() {
    //clear form
    $('input[name=name]').val("");
    $('input[name=port]').val("");
    $('#additionalEndpointContainer').empty();
    $('#additionalAttributeContainer').empty();
    $('input[name=endpoint]').val("");
    $('#serviceRegistriesTitle').text("Add a Service");
    $('#oldServiceName').val("");
}

function refreshGrid() {
    $.get( "/ServiceRegistries", function( data ) {
        $('#serviceRegistriesHolder').empty()

        var content = $('#serviceRegistriesTemplate')[0].content;
        $('#serviceRegistriesHolder').append(document.importNode(content, true))
        var result = JSON.parse(data);
        for( i = 0; i < result.length; i++) {
          var entity = result[i];

          var attributes = ""
          $.each(entity.attributes, function(key, value) {
            attributes += key + " = " + value + ",";
          });
          attributes = attributes.substring(0, attributes.length - 1);

          var content = $('#serviceRegistriesRowTemplate')[0].content;
          content.querySelector('.name').innerHTML = entity.name;
          content.querySelector('.endpoints').innerHTML = entity.endpoints.join(",");
          content.querySelector('.port').innerHTML = entity.port;
          content.querySelector('.attributes').innerHTML = attributes;

          $('#serverRegistries tbody').append(document.importNode(content, true)) ;
        }
        $('#serverRegistries').dataTable();

        $('.paginate_button').each(function(index,item){
          $(item).bind( "click", function() {

            //on any item click, reinit the action buttons
            $('.paginate_button').each(function(index,item){
              $(item).bind( "click", function() {
                initActionButtons();
              });
              initActionButtons();
            });
          });
        });

        initActionButtons();
    });
}

function postService() {

  var attributes = { }
  var endpoints =  $.map( $('[name=endpoint]'), function(item) { return $(item).val()  })
  var keys =  $.map( $('[name=key]'), function(item) { return $(item).val()  })
  var values =  $.map( $('[name=keyValue]'), function(item) { return $(item).val()  })
  $(keys).each(function(index, item) { if(item !== "") attributes[item] = values[index] })

  var postData = { "name" : $('#serviceRegistriesName').val(),
                   "port" : parseInt($('#serviceRegistriesPort').val()),
                   "endpoints" : endpoints,
                   "attributes" : attributes
  };


  $.ajax("ServiceRegistries", {
    data : JSON.stringify(postData),
    contentType : 'application/json',
    type : 'POST' })

  .done(function() {
    clearForm();
    //close modal
    $('#addService').foundation('reveal', 'close');
    refreshGrid();
  })

}

function addEndpoint(value) {
  var content = $('#addEndpointTemplate')[0].content;
  if(value) {
    $(content.querySelector('input')).val(value);
  }
  $('#additionalEndpointContainer').append(document.importNode(content, true))
  $(content.querySelector('input')).val("");
}

function initEventHandlers() {
    $('#addEndpoint').bind( "click", function() {
        addEndpoint();
    });

    $('#addAttribute').bind( "click", function() {
        var content = $('#addAttributeTemplate')[0].content;
        $('#additionalAttributeContainer').append(document.importNode(content, true))
    });

    $('#save').bind( "click", function() {
      postService();
    })

    $(document).on('closed.fndtn.reveal', '[data-reveal]', function () {
      if(this.id === "addService") {
        clearForm();
      }
    });

    $('#confirmDeleteButton').bind( "click", function() {
        $.ajax({
           url: '/ServiceRegistries/' + encodeURIComponent($('#deleteName').val()),
           type: 'DELETE',
        success: function(result) {
           //close dialog
           $('#confirmDelete').foundation('reveal', 'close');
           //refresh grid
           refreshGrid();
        }
      });
    });

     //TODO, delete
    //stop form from submitting to new page
    $('form').submit(function(){
        $.post($(this).attr('action'), $(this).serialize(), function(response){
      },'json')
      .always(function(){

        clearForm();
        //close modal
        $('#addService').foundation('reveal', 'close');
        refreshGrid();
      });

      return false;
    });
}


function initActionButtons() {
    //add delete listener
    $('.delete').each(function(index,item){
        $(item).bind( "click", function() {

        //set the name of the service to delete, the window will handle the rest
        var rowItems = $(item).parent().parent().children();
        var name = rowItems.first().children().first().text();
        $('#deleteName').val(name);
        });
    });

    $('.edit').each(function(index,item){
      $(item).bind( "click", function() {
        //set title to edit
        $('#serviceRegistriesTitle').text("Edit a Service");

        //set values
        //TODO, set all values
        var rowItems = $(item).parent().parent().children();
        var name = rowItems.first().children().first().text();
        var endpoints = $(rowItems[1]).children().first().text().split(',');
        $('#oldServiceName').val(name);
        $('#serviceRegistriesName').val(name);
        $('#serviceRegistriesPort').val($(rowItems[2]).children().first().text());

        var first = true;
        $(endpoints).each(function(index, value) {
          if(first) {
            $('#endpoint').val(value)
            first = false;
            return;
          }
          addEndpoint(value);
        })

        //open edit
        $('#addService').foundation('reveal', 'open');

      } );
    });
}
