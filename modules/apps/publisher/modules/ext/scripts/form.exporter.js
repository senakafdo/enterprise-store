var meta={
	use:'export',
	type:'form',
	required:['model','template']
};

/*
 Description: Converts the data and template to format that can be used to render a form.
 Filename:form.exporter.js
 Created Dated: 11/8/2013
 */

var module=function(){

    var log=new Log();

    var buildOptionsObject = function (field, fieldTemplate, data) {
        //Only apply the logic if the field type is options
        if (!data.isOptions) {
            return;
        }

        var optionData = {};
        var options = csvToArray(fieldTemplate.value || '');
        optionData['selected'] = field.value;

        //Drop the selected value
        optionData['options'] = options.filter(function (element) {
            return element != field.value ? true : false;
        });

        data['optionData'] = optionData;

    };
	
	/*
	 * Go through each table and extract field data
	 */
	function fillFields(table,fieldArray,template,isNewTable,isEndTable){

        //var username=obtainUserNameFromSession();
        //log.debug('logged in user: '+username);
		//Go through each field
        var tableName  = null;
        //var isNewTable = false;
        //var isEndTable = false;
		for each(var field in table.fields){

            //if (tableName != null && !table.name.equals(tableName)){
            //    isEndTable = true;
            //}

            tableName = table.name;
            //table.isNewTable =   isNewTable;

			
			//Obtain the field details from the template
			var fieldTemplate=template.getField(table.name,field.name);
			
			//We ignore the field if it is not in the template
			if(!fieldTemplate){
                log.debug('Ignoring field: '+stringify(fieldTemplate));
				return;
			}
			//Ignore the field which is set as hidden
			if(fieldTemplate.meta.hidden == "false"){
			var data={};

			data['name']=table.name+'_'+field.name;
			data['label']=(fieldTemplate.label)?fieldTemplate.label:field.name;
			data['isRequired']=(fieldTemplate.required)?true:false;
			data['isTextBox']=(fieldTemplate.type=='text')?true:false;
			data['isTextArea']=(fieldTemplate.type=='text-area')?true:false;
			data['isOptions']=(fieldTemplate.type=='options')?true:false;
            data['isOptionsText']=(fieldTemplate.type=='option-text')?true:false;

            data['isReadOnly']=(fieldTemplate.meta.readOnly)?fieldTemplate.meta.readOnly:false;
            data['isEditable']=(fieldTemplate.meta.editable)?fieldTemplate.meta.editable:false;
            data['isFile']=(fieldTemplate.type=='file')?true:false;

			data['value']=field.value;
			
			data['valueList']=csvToArray(fieldTemplate.value||'');
            //log.info(table);
            data['isNewTable']= isNewTable;
            data['isEndTable']= isEndTable;
            data['tableName']= 'Show Advance Settings';
            data['tableNameTest']= 'other';

            if(!data['isRequired']){
               fieldArray.push(data);
               isNewTable = false;
               isEndTable = false;
            }

            }

		}

		return fieldArray;
	}

    function fillReqFields(table,fieldArray,template,isNewTable,isEndTable){

        //var username=obtainUserNameFromSession();
        //log.debug('logged in user: '+username);
        //Go through each field
        var tableName  = null;
        for each(var field in table.fields){


            //if (tableName != null && !table.name.equals(tableName)){
            //    isEndTable = true;
            //}

            tableName = table.name;
            //table.isNewTable =   isNewTable;


            //Obtain the field details from the template
            var fieldTemplate=template.getField(table.name,field.name);

            //We ignore the field if it is not in the template
            if(!fieldTemplate){
                log.debug('Ignoring field: '+stringify(fieldTemplate));
                return;
            }
            //Ignore the field which is set as hidden
            if(fieldTemplate.meta.hidden == "false"){
                var data={};

                data['name']=table.name+'_'+field.name;
                data['label']=(fieldTemplate.label)?fieldTemplate.label:field.name;
                data['isRequired']=(fieldTemplate.required)?true:false;
                data['isTextBox']=(fieldTemplate.type=='text')?true:false;
                data['isTextArea']=(fieldTemplate.type=='text-area')?true:false;
                data['isOptions']=(fieldTemplate.type=='options')?true:false;
                data['isOptionsText']=(fieldTemplate.type=='option-text')?true:false;

                data['isReadOnly']=(fieldTemplate.meta.readOnly)?fieldTemplate.meta.readOnly:false;
                data['isEditable']=(fieldTemplate.meta.editable)?fieldTemplate.meta.editable:false;
                data['isFile']=(fieldTemplate.type=='file')?true:false;

                data['value']=field.value;

                data['valueList']=csvToArray(fieldTemplate.value||'');
                //log.info(table);
                data['isNewTable']= isNewTable;
                data['isEndTable']= isEndTable;
                data['tableName']= 'Required Information';
                data['tableNameText']= 'required';
                if(data['isRequired']){
                    fieldArray.push(data);
                    isNewTable = false;
                    isEndTable = false;
                }

            }

        }

        return fieldArray;
    }

    /*
    The function obtains the currently logged in user from the session
     */
    function obtainUserNameFromSession(){

        var username='unknown';
        try{
            username=require('store').server.current(session).username;//.get('LOGGED_IN_USER');
        }
        catch(e){
            log.debug('Unable to retrieved logged in user from sessions.The following exception was thrown: '+e);
        }
        return username;
    }
	
	/*
	 * Fills all of the tables except the *(global)
	 */
	function fillTables(model,template){
		
		var fieldArray=[];
        //Go through each table in the model
        var isNewTable = true;
        var isEndTable = false;

        for each(var table in model.dataTables){
            //Ignore if *
            if(table.name!='*'){
                fillReqFields(table,fieldArray,template,isNewTable,isEndTable);
                isNewTable = false;
                isEndTable = false;
            }
        }


        isNewTable = true;
        isEndTable = true;

        for each(var table in model.dataTables){
            //Ignore if *
            if(table.name!='*'){
                fillFields(table,fieldArray,template,isNewTable,isEndTable);
                isNewTable = false;
                isEndTable = false;
            }
        }


        log.info('Fields: '+stringify(fieldArray));
		
		return fieldArray;
	}

    /*
    The function converts a string comma seperated value list to an array
    @str: A string representation of an array
    TODO: Move to utility script
     */
	function csvToArray(str){
		var array=str.split(',');
		return array;
	}
	
	function fillMeta(model,template){
		var meta={};
		meta['shortName']=template.shortName;
		meta['singularLabel']=template.singularLabel;
		meta['pluralLabel']=template.pluralLabel;

        log.debug('Meta: '+stringify(meta));
		return meta;
	}
	
	function fillInfo(model){
		var info={};
		
		var field=model.getField('*.id');
		info['id']=field?field.getValue():'';
		
		field=model.getField('*.lifecycle');
		info['lifecycle']=field?field.getValue():'';
		
		field=model.getField('overview.version');
		info['version']=field?field.getValue():'';
		
		field=model.getField('*.lifecycleState');

		info['lifecycleState']=field?field.getValue():'';

        log.debug('Info: '+stringify(info));
		
		return info;
	}
	
	return{
		execute:function(context){

            log.debug('Entered: '+meta.type);

			var model=context.model;
			var template=context.template;
			
			var struct={};

			//TODO: Move this check outside
			if((!model)||(!template)){
                log.debug('Required parameters: '+meta.required+'not available to adapter');
				throw 'Required model and template data not present';
			}

			var tables= fillTables(model,template);
			
			struct['fields']=tables;
			struct['meta']=fillMeta(model,template);
			struct['info']=fillInfo(model);

            log.debug('Leaving: '+meta.type);
			
			return struct;

		}
	}
};
