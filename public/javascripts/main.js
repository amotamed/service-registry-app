function getAttributesAsString(attributes) {
    return $.map(attributes, function(value, key) {
        return key + " = " + value;
    });
}

function clearForm() {
    //clear form
    document.forms[0].reset();
    $('#additionalAttributeContainer, #additionalEndpointContainer').empty();
    $('#serviceRegistriesTitle').text("Add a Service");
}

function handleServiceSave() {

    //validate form, return false if form has errors
    var result = Foundation.libs.abide.parse_patterns($('input[name=name], input[name=port], [name=endpoint]'));
    var errors = $.grep(result, function(val) { if(!val) return true } )
    if( errors.length > 0 ) {
      return false;
    }

    var oldServiceName = $('#oldServiceName').val();
    var newServiceName = $('input[name=name]').val();
    if( oldServiceName !== "" && oldServiceName !== newServiceName) {
        deleteService(oldServiceName, function() { postService() } );
    }
    else {
        postService();
    }
}

function initGrid() {
    $.get( "/ServiceRegistries", function(data) {

        var result = JSON.parse(data);
        var data = [];
        var result = $.each(result, function(index, entity) {

            data.push([ entity.name,
                entity.port,
                entity.endpoints,
                getAttributesAsString(entity.attributes)
            ]);

        });

        $('#serverRegistries').dataTable( {
            "data": data,
            "columns": [
                { "title": "Name", "class": "name nameHeader"  },
                { "title": "Port" , "class": "port" },
                { "title": "Endpoints", "class": "endpoints" },
                { "title": "Attributes", "class": "attributes"},
                { "title": "Actions" }
            ],
            "columnDefs": [
                {
                  "data": null,
                  "defaultContent": '<input type="button" value="edit">' +
                    '<input type="button" data-reveal-id="confirmDelete" value="delete">',
                  "targets": -1
                }
              ]
        } );

        initActionButtons();
    });
}

function postService() {

  var attributes = { };
  var name = $('input[name=name]').val();
  var port = parseInt($('input[name=port]').val());
  var endpoints =  $.map( $('[name=endpoint]'), function(item) { return $(item).val()  });
  var keys =  $.map( $('[name=key]'), function(item) { return $(item).val()  });
  var values =  $.map( $('[name=keyValue]'), function(item) { return $(item).val()  });
  $(keys).each(function(index, item) { if(item !== "") attributes[item] = values[index] });

  var postData = { "name" : name,
                   "port" : port,
                   "endpoints" : endpoints,
                   "attributes" : attributes
  };

  $.ajax("ServiceRegistries", {
    data : JSON.stringify(postData),
    contentType : 'application/json',
    type : 'POST' })
  .done(function() {
    //close modal
    $('#addService').foundation('reveal', 'close');
    $('#serverRegistries').DataTable().row.add([ name, port, endpoints, getAttributesAsString(attributes) ]).draw(true);
    initActionButtons();
    clearForm();
  }) ;

}

function deleteService(name, callback) {
  $.ajax({
      url: '/ServiceRegistries/' + encodeURIComponent(name),
      type: 'DELETE',
      success: function(result) {
          //close dialog
          $('#confirmDelete').foundation('reveal', 'close');
          $('#serverRegistries').dataTable().fnDeleteRow($('#currentIndex').val())
          if(callback) {
            callback.apply();
          }
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

    $('#save').bind( "click", function(event) {
        handleServiceSave();
    });

    $("#addService").keypress(function (event) {
        if(event.keyCode === 13) {
            handleServiceSave();
        }
    });

    $(document).on('closed.fndtn.reveal', '[data-reveal]', function () {
        if(this.id === "addService") {
            clearForm();
        }
    });

    $(document).on('opened.fndtn.reveal', '[data-reveal]', function () {
        $('input[name=name]').focus();
    });

    $('#confirmDeleteButton').bind( "click", function() {
      deleteService($('#deleteName').val(), function(){  });
    });
}


function initActionButtons() {
    $('input[value=delete]').each(function(index,item){
        $(item).bind( "click", function() {

        //set the name of the service to delete, the window will handle the rest
        var rowItems = $(item).parent().parent().children();
        var index = $('#serverRegistries').dataTable().fnGetPosition( $(item).closest('tr')[0] );
        $('#currentIndex').val(index);
        $('#deleteName').val(rowItems.first().text());
        });
    });

    $('input[value=edit]').each(function(index,item){
      $(item).bind( "click", function() {
        //set title to edit
        $('#serviceRegistriesTitle').text("Edit a Service");

        //set values
        var rowItems = $(item).parent().parent().children();
        var name = rowItems.first().text();
        var endpoints = $(rowItems[2]).text().split(',');
        var attributes = $(rowItems[3]).text().trim().split(',');

        var index = $('#serverRegistries').dataTable().fnGetPosition( $(item).closest('tr')[0] );
        $('#currentIndex').val(index);

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
