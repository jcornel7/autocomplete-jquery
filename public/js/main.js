'use strict';
$(function(){
    //Simple Trie class to add and find strings
    class TrieNode {
        constructor(options) {
            this.children = [];
            this.data = [];
            this.addChildNodes(options.characters, options.data);
        }
        addChildNodes(charArray, data){
            // All nodes contain array of children data
            this.data.push(data);
            if(charArray.length === 0){
                return;
            }
            // Insert characters as lowercase
            var countryChar = charArray[0].toLowerCase();
            // If we have a match
            if(this.children[countryChar]){
                //Add node on child
                this.children[countryChar].addChildNodes(charArray.splice(1), data);
            }else{
                //Create new node
                this.children[countryChar] = new TrieNode({
                    characters: charArray.splice(1),
                    data: data
                });
            }
        }
        findData(charArray){
            //Char sequence ended, return node's data
            if(charArray.length === 0){
                if(this.data){
                    return this.data;
                }
            }
            //If we have a child matching a character
            var charToFind = charArray[0].toLowerCase();
            if(this.children[charToFind]){
                //Call child's findData
                return this.children[charToFind].findData(charArray.splice(1));
            }
            //Else return empty array
            return [];
        }
    }

    //Our selected countries
    var selectedCountries = {};

    //Root Trie node
    var RootNode;

    //Parse data and build our Trie
    var buildTrie = function(data){
        var countries = data.split('\n');

        var firstCountryData = countries[0].split(',');

        RootNode = new TrieNode({
            characters: firstCountryData[0].split(''),
            data: firstCountryData
        });

        for(var i = 1; i < countries.length; i++){
            var countryData = countries[i].split(',');
            RootNode.addChildNodes(countryData[0].split(''), {
                data: countryData
            });
        }
    }

    //Helper to build country rows
    var buildFlagRow = function(data, rowType){
        var fullName = data[0];
        var countryId = data[1];
        var img = rowType === 'small' ? data[2] : data[3];
        var selectedClass = data.isSelected ? 'selected' : '';
        var $row = $('<tr class="' + selectedClass + ' countryRow">');
        $row.append($('<td>').append($('<img>').attr('src', './flags/' + img)));
        $row.append($('<td>').text(countryId));
        $row.append($('<td>').text(fullName));
        return $row;
    }

    var addTypeaheadRows = function(dataArray){
        //Limit our results to 10
        for(var i = 0; i < 10 && i < dataArray.length; i++){
            var dataItem = dataArray[i].length? dataArray[i] : dataArray[i].data;
            //Set isSelected to add special class
            dataItem.isSelected = selectedCountries[dataItem[1]];
            //Append a small row to typeAhead
            var $row = buildFlagRow(dataItem, 'small');
            $('#typeAhead tbody').append($row);
            //Selection handler
            $row.click(selectionHandler.bind($row, dataItem));
        }
    }

    //On keyup, get current value of input and find data in Trie.
    var keyHandler = function(){
        var enteredString = $( "#countryInput" ).val();
        //Clear typeahead
        $('#typeAhead tbody').empty();
        if(enteredString.length > 0){
            //Find and add data
            var dataArray = RootNode.findData(enteredString.split(''));
            addTypeaheadRows(dataArray);
        }
    }

    //Handler for click on typehead row
    var selectionHandler = function(data){
        var countryId = data[1];
        if(!selectedCountries[countryId]){
            //Add class to typeahead selection
            $(this).addClass('selected');
            //Append a large row to selectedCountries
            var $row = buildFlagRow(data, 'large');
            $('#selectedCountries tbody').append($row);
            //Set selected country to true
            selectedCountries[countryId] = true;
        }
    }

    $.get('./countries.csv', function(data){
        buildTrie(data);
        $( "#countryInput" ).on('keyup', keyHandler);
    });
});
