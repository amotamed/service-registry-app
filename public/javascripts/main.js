function clearForm() {
    //clear form
    $('input[name=name], input[name=port], input[name=endpoint], #oldServiceName').val("");
    $('#additionalAttributeContainer, #additionalEndpointContainer').empty();
    $('#serviceRegistriesTitle').text("Add a Service");
}

function refreshGrid() {
    $.get( "/ServiceRegistries", function( data ) {

        //TODO, remove and switch to init grid
        $('#serviceRegistriesHolder').empty()
        var content = $('#serviceRegistriesTemplate')[0].content;
        $('#serviceRegistriesHolder').append(document.importNode(content, true))

        var result = JSON.parse(data);
        var data = []
        for( i = 0; i < result.length; i++) {

          var entity = result[i];
          var attributes = $.map(entity.attributes, function(value, key) {
            return key + " = " + value;
          });

          data.push([ entity.name,
              entity.port,
              entity.endpoints,
              attributes,
              '<input type="button" class="edit" value="edit"><input type="button" data-reveal-id="confirmDelete" class="delete" value="delete">'
          ]);

        }

         $('#serverRegistries').dataTable( {
                       "data": data,
                       "columns": [
                           { "title": "Name", "class": "name nameHeader"  },
                           { "title": "Port" , "class": "port" },
                           { "title": "Endpoints", "class": "endpoints" },
                           { "title": "Attributes", "class": "attributes"},
                           { "title": "Actions" }
                       ]
                   } );

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

  var postData = { "name" : $('input[name=name]').val(),
                   "port" : parseInt($('input[name=port]').val()),
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
  }) ;

}

function deleteService(name, callback) {
  $.ajax({
      url: '/ServiceRegistries/' + encodeURIComponent(name),
      type: 'DELETE',
      success: function(result) {
          //close dialog
          $('#confirmDelete').foundation('reveal', 'close');
          callback.apply();
      }
  });
}

function addEndpoint(value) {
    var content = $('#addEndpointTemplate')[0].content;
    $(content.querySelector('input')).val(value);
    $('#additionalEndpointContainer').append(document.importNode(content, true))
    $(content.querySelector('input')).val("");
}

function addAttribute(key, value) {
    var content = $('#addAttributeTemplate')[0].content;
    $(content.querySelector('input[name=key]')).val(key)
    $(content.querySelector('input[name=keyValue]')).val(value)
    $('#additionalAttributeContainer').append(document.importNode(content, true))
}

function initEventHandlers() {
    $('#addEndpoint').bind( "click", function() {
        addEndpoint();
    });

    $('#addAttribute').bind( "click", function() {
        addAttribute();
    });

    $('#save').bind( "click", function() {
      var oldServiceName = $('#oldServiceName').val();
      var newServiceName = $('input[name=name]').val();
      if( oldServiceName !== "" && oldServiceName !== newServiceName) {
        deleteService(oldServiceName, function() { postService });
      }
      postService();
    })

    $(document).on('closed.fndtn.reveal', '[data-reveal]', function () {
      if(this.id === "addService") {
        clearForm();
      }
    });

    $('#confirmDeleteButton').bind( "click", function() {
      deleteService($('#deleteName').val(), function(){ refreshGrid(); });
    });
}


function initActionButtons() {
    //add delete listener
    $('.delete').each(function(index,item){
        $(item).bind( "click", function() {

        //set the name of the service to delete, the window will handle the rest
        var rowItems = $(item).parent().parent().children();
        var name = rowItems.first().text();
        $('#deleteName').val(name);
        });
    });

    $('.edit').each(function(index,item){
      $(item).bind( "click", function() {
        //set title to edit
        $('#serviceRegistriesTitle').text("Edit a Service");

        //set values
        var rowItems = $(item).parent().parent().children();
        var name = rowItems.first().text();
        var endpoints = $(rowItems[2]).text().split(',');
        var attributes = $(rowItems[3]).text().trim().split(',');

        $('#oldServiceName').val(name);
        $('input[name=name]').val(name);
        $('input[name=port]').val($(rowItems[1]).text());

        $(endpoints).each(function(index, value) {
          if(index === 0) {
            $('#endpoint').val(value)
            return;
          }
          addEndpoint(value);
        })

        $(attributes).each(function(index, value) {
            if(value.indexOf("=") != -1) {
                var pair = value.split("=");
                addAttribute(pair[0].trim(), pair[1].trim());
            }
        })

        //open edit
        $('#addService').foundation('reveal', 'open');

      } );
    });
}
