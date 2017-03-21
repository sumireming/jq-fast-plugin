template.config('openTag', '<<')
template.config('closeTag', '>>')

template.helper('filter', function (str, keyword) {
    var re = '';
    if($.trim(keyword) != '' && str.search(keyword) == -1) {
        re = 'hide';
    }
    return re;
});

template.helper('isChecked', function (arr, str) {

    if(arr) {
        var arr_s = arr.join(',');
        if(arr_s.search(str) != -1) {
            return 'checked';
        }

    }

});


$.fn.extend({
    invokeTemp : function(obj, temp_name) {
        var temp_name = temp_name || $(this).attr('section-name');
        if(temp_name && temp_name != '') {
            var html = template('tpl-' + temp_name, obj);
            $(this).html(html);
            if(obj.callback) {
                obj.callback();
            }
        }
    },
    rect : function(position) {
        if(this.length > 0 && document.body.getBoundingClientRect) {
            return this[0].getBoundingClientRect()[position];
        }
    },
    smartTable : function(type) {

        var self = this;

        var table_px = $(self).rect('left');
        var table_py = 0;

        var x_html = $(self).find('thead td').map(function(){
            var width = $(this).width() + 18;
            var height = $(this).height() + 18;
            return '<div class="table-td" style="width: ' + width + 'px; height: ' + height + 'px;">' + $.trim($(this).text()) + '</div>'
        }).get().join('');
        var horizontal_titles = $('<div class="horizontal_titles"></div>').append(x_html);
        $(self).parent().append(horizontal_titles);

        var y_html = $(self).find('tbody tr').map(function(){
            var width = $(this).find('td:eq(0)').width() + 18;
            return '<div class="table-td" style="width: '+width+'px;" >' + $.trim($(this).find('td:eq(0)').text()) + '</div>'
        }).get().join('');
        var vertical_titles = $('<div class="vertical-titles"></div>').append(y_html);
        $(self).parent().append(vertical_titles);

        var x_flag = false;
        var y_flag = false;

        $(window).on('scroll', function(){

            var top = $(self).rect('top');


            if(top <= table_py) {
                var left_value = $(self).find('tbody').rect('left');

                horizontal_titles.addClass('table-smart');
                horizontal_titles.css('top', table_py + 'px');
                horizontal_titles.css('left', left_value + 'px');

                x_flag = true;

            }else{
                horizontal_titles.removeClass('table-smart');
                horizontal_titles.removeAttr('style');
                x_flag = false;

            }

            if(y_flag) {
                var top_value = $(self).find('tbody').rect('top');
                vertical_titles.css('top', top_value + 'px');
            }
        });


        $(self).parent().on('scroll', function(){

            var left = $(self).rect('left');
            if(left < table_px) {
                vertical_titles.addClass('table-smart');
                var top_value = $(self).find('tbody').rect('top');
                vertical_titles.css('top', top_value + 'px');
                vertical_titles.css('left', table_px + 'px');
                y_flag = true;
            }else{
                vertical_titles.removeClass('table-smart');
                vertical_titles.removeAttr('style');
                y_flag = false;
            }

            if(x_flag) {
                var left_value = $(self).find('tbody').rect('left');
                horizontal_titles.css('left', left_value + 'px');
            }

        });
    },
    smartDragIn : function smartDragFunc(o) {
        $(this).on('mousedown ', o.dragSelector, function(e){
            if(e.type == 'mousedown') {
                smartDragFunc.currentSelector = $(this);
                smartDragFunc.currentSelector.screenX = e.screenX;
                smartDragFunc.currentSelector.screenY = e.screenY;

                if(o.dragStart) {
                    o.dragStart(e, smartDragFunc.currentSelector);
                }
            }

        });

        $('body').on('mousemove mouseup', function(e){

            if(e.type == 'mousemove' && smartDragFunc.currentSelector) {
                $('body').css('cursor', 'move');

                if(o.dragMoving) {
                    o.dragMoving(e, smartDragFunc.currentSelector);
                }

            }

            if(e.type == 'mouseup' && smartDragFunc.currentSelector) {
                $('body').css('cursor', '');

                if(o.dragEnd) {
                    o.dragEnd(e, smartDragFunc.currentSelector);
                }

                smartDragFunc.currentSelector = null;

            }


        })

    }

});

(function($){

    $.alert = function(status, text) {
        $('.alert-bar').invokeTemp({status : status, text : text});
        $('.alert-bar').fadeIn().delay(2000).fadeOut();
    };


    $.getParam = function(name) {
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var r = location.search.substr(location.search.indexOf("?")+1).match(reg);
        if (r!=null) return unescape(r[2]); return null;
    };

    $.getParambyurl = function(name, url) {
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var url = url || location.href;
        var r = url.substr(url.indexOf("?")+1).match(reg);
        if (r!=null) return unescape(r[2]); return null;
    }

    $.getHash = function() {
        var hash = location.hash.replace('#', '');
        if(hash != '') {
            return location.hash.replace('#', '')
        }else{
            return null;
        }
    }

})(window.jQuery);


// 导航
(function($){

    function Nav(o) {

        this.list = o.data;
        this.appid = o.appid;
        this.v2_index = o.v2_index,
        this.parentNodeid = o.parentNodeid;
        this.activeIndex = o.active;
        this.activekey = o.activekey;
        this.wrap = o.wrap;
        this.insertAfterElem = o.insertAfterElem || null;
        this.normalCallback = o.normalCallback;
        this.specialCallback = o.specialCallback;
        this.initCallback = o.initCallback;
        this.init();
    }

    Nav.prototype = {
        init : function() {
            this.clearEvent();
            this.updateNav();
            this.invokeClickCallback();
            this.initActiveLi();
            if(this.initCallback) {
                this.initCallback(this.wrap, this.list, this.activeIndex);
            }
        },
        clearEvent : function() {
            this.wrap.off('click');
        },
        updateNav : function() {
            var obj = {list : this.list, activeIndex : this.activeIndex, appid : this.appid, parentNodeid : this.parentNodeid, v2_index : this.v2_index};
            this.wrap.invokeTemp(obj);
        },
        updateActive : function(mid) {
            this.wrap.find('li.active').removeClass('active');
            this.wrap.find('[mid='+mid+']').addClass('active');
        },
        initActiveLi : function() {
            var self = this;
            if(self.activeIndex) {
                setTimeout(function(){
                    self.wrap.find('li').eq(self.activeIndex).click();
                },200)
                return;
            }else if(self.activekey) {
                setTimeout(function(){
                    self.wrap.find('[mid='+self.activekey+']').click();
                },200)
            }else{
                self.activeIndex = 0;
                self.wrap.find('li[index=0]').click();
                self.updateNav();
            }

        },
        invokeClickCallback : function() {
             var self = this;
             this.wrap.on('click', 'li', function(e){
                 var index = $(this).attr('index');
                 var mid = $(this).attr('mid');
                 var name = $(this).attr('name');
                 var node = self.list[index];

                 if(index && mid && name) {
                     if(self.normalCallback) {
                         self.normalCallback($(this));
                     }

                     if(self.specialCallback && self.specialCallback(node, index)) {
                         self.updateActive(mid);
                     }else{
                         self.updateActive(mid);
                     }
                 }

             })
        }
    }

    $.nav = Nav;

})(window.jQuery);

// 面包屑
(function($){

    function Crumbs(o) {

        this.data = o.data;
        this.wrap = o.wrap;

        this.init();
    }

    Crumbs.prototype = {

        init : function() {
            this.updateCrumbs();
        },
        updateCrumbs : function() {
            var obj = {list : this.data};
            this.wrap.invokeTemp(obj);
        },
        addNewCrumbs : function(node) {
            if(this.data && this.data.push) {
                this.data.push(node);
                this.updateCrumbs();
            }

        },
        removeLastCrumbs : function() {
            this.data.splice(this.data.length -1 , 1);
            this.updateCrumbs();
        },
        replaceCrumbs : function(node) {
            this.data[this.data.length - 1] = node;
            this.updateCrumbs();
        },
        replaceAllCrumbs : function(data) {
            this.data = data;
            this.updateCrumbs();
        },
        addlink : function(name, callback) {
            this.wrap.find('#crumblink').html(name);
            this.wrap.find('#crumblink').on('click', callback);
        },
        removelink : function() {
            this.wrap.find('#crumblink').html('');
            this.wrap.find('#crumblink').off('click');
        }

    };

    $.crumbs = Crumbs;

})(window.jQuery);

// 弹层
(function($){

    function Popup(o) {
        this.type = o.type; // alert & form
        this.data = o.data;
        this.tempName = o.tempName || 'modal';
        this.wrap;
        this.onshow = o.onshow;
        this.onhide = o.onhide;
        this.onsubmit = o.onsubmit; // 必须返回true/false
        this.init();
    }

    Popup.prototype = {
        init : function() {
            this.createWrap();
            this.clearEvent();
            this.updateInner();
            this.wrap.modal();
            if(this.onshow) {
                this.onshow(this.wrap);
            }
            this.invokeBtnClick();
        },
        clearEvent : function() {
            this.wrap.off('click');
            this.wrap.off('change');
        },
        createWrap : function() {
            var wrap = $('.modal');
            if(wrap.length == 0) {
                wrap = $('<div class="modal" id="modal"></div>');
                $('body').append(wrap);
            }
            this.wrap = wrap;
        },
        updateInner : function(data) {
            var data = data || this.data;
            this.wrap.invokeTemp(data, this.tempName);
        },
        invokeBtnClick : function() {

            var self = this;
            this.wrap.on('click', '.btn', function(e){
                var action = $(this).attr('action');
                if(action == 'submit') {
                    var flag = self.onsubmit ? self.onsubmit(self.wrap) : true;
                    if(flag == true) {
                        self.wrap.modal('hide');
                    }
                }

            })

        },
        close : function() {
            this.wrap.modal('hide');
        }
    };

    $.popup = Popup;

})(window.jQuery);

// 可编辑树
(function($){

    function Tree(o) {
        var self = this;
        $.each(o, function(key, value){
            self[key] = value;
        });
        this.highestlevel = 0;
        this.wrap = o.wrap || $('body');
        this.init();
    }

    Tree.prototype = {
        init : function() {
            this.clearEvent();
            this.updateTree();
            this.invokeBtnClick();
            this.invokeNameClick();
            this.invokeIconClick();
            this.invokeDragNode();
            this.invokeExpand();
        },
        clearEvent : function() {
            this.wrap.off('click');
        },
        updateTree : function(callback) {
            var obj = {tree : this.data.tree, app_list:this.data.app_list, level : 1};
            console.log(this.data.tree)
            $(this.wrap).invokeTemp(obj);
            if(callback) {
                callback();
            }
        },
        hasParentNode : function(nodeid) {
            return nodeid.search(/-\d+$/) != -1;
        },
        getTreeNode : function(nodeid) {
           if(!nodeid || nodeid == '') {
                return this.data.tree;
            }else{
                var index_arr = nodeid.split('-');
                var node = this.data.tree;
                for(var i = 0; i<index_arr.length; i++) {
                    if(node.nodes) {
                        node = node.nodes[index_arr[i]]
                    }else{
                        node = node[index_arr[i]];
                    }
                }
                return node;
            }

        },
        getParentNode : function(nodeid) {
            var parent;
            if(this.hasParentNode(nodeid)) {
                var parent_nodeid = nodeid.replace(/-\d+$/,'');
                parent = this.getTreeNode(parent_nodeid);
            }
            return parent;
        },
        getParentNodeId : function(nodeid) {
            return nodeid.replace(/-\d+$/, '');
        },
        getNodeIndex : function(nodeid) {
            var index;
            if(this.hasParentNode(nodeid)) {
                index = nodeid.match(/\d+$/)[0];
            }else{
                index = nodeid;
            }
            return index;
        },
        getNextNode : function(nodeid) {
            var nextNodeId;
            if(this.hasParentNode(nodeid)) {
                var index = this.getNodeIndex(nodeid);
                var parent = this.getParentNode(nodeid);
                if(index != parent.nodes.length - 1) {
                    nextNodeId = nodeid.replace(/\d+$/, parseInt(index) + 1);
                }

            }else{
                if(nodeid != this.data.tree.length - 1) {
                    nextNodeId = parseInt(nodeid) + 1 + '';
                }
            }
            return nextNodeId;
        },
        getPreviousNode : function(nodeid) {
            var previousnodeId;
            if(this.hasParentNode(nodeid)) {
                var index = this.getNodeIndex(nodeid);
                if(index != 0) {
                    previousnodeId = nodeid.replace(/\d+$/, parseInt(index) - 1);
                }
            }else{
                if(nodeid != 0) {
                    previousnodeId = (parseInt(nodeid) - 1) + '';
                }
            }
            return previousnodeId;
        },
        // 同级兄弟节点交换位置
        exchangeNodes : function(nodeid1, nodeid2) {
            var index1 = this.getNodeIndex(nodeid1);
            var index2 = this.getNodeIndex(nodeid2);
            var temp;
            if(this.hasParentNode(nodeid1)) {
                var parent = this.getParentNode(nodeid1);
                temp = parent.nodes[index1];
                parent.nodes[index1] = parent.nodes[index2];
                parent.nodes[index2] = temp;
            }else{
                temp = this.data.tree[index1];
                this.data.tree[index1] = this.data.tree[index2];
                this.data.tree[index2] = temp
            }
        },
        updateTreeSilbingName : function(name, mid, nodeid) {
            var current_node = this.getTreeNode(nodeid);
            current_node.name = name;
            current_node.mid = mid;
        },
        addTreeSibling : function(newnode, nodeid) {
            if(nodeid) {
                var current_node = this.getTreeNode(nodeid);
                if(current_node.nodes) {
                    current_node.nodes.push(newnode);
                }else{
                    current_node.nodes = [newnode];
                }
            }else{
                this.data.tree.push(newnode);
            }
        },
        copyTreeSibling : function(newnode, nodeid) {
            var newnodeid = '';
            if(this.hasParentNode(nodeid)) {
                var parent_nodeid = nodeid.replace(/-\d+$/,'');
                this.addTreeSibling(newnode, parent_nodeid);
                newnodeid = parent_nodeid + '-' + this.getTreeNode(parent_nodeid).length;
            }else{
                this.addTreeSibling(newnode);
            }
            return newnodeid;
        },
        removeTreeSibling : function(nodeid) {
            var last_index, parent_nodeid, parent;
            if(this.hasParentNode(nodeid)) {
                last_index = nodeid.match(/\d+$/)[0];
                parent_nodeid = nodeid.replace(/-\d+$/,'');
                parent = this.getTreeNode(parent_nodeid).nodes;
            }else{
                last_index = nodeid;
                parent = this.data.tree;
            }

            parent.splice(last_index, 1);
            return parent_nodeid;
        },
        invokeNameClick : function() {
            var self = this;
            this.wrap.on('click', '.list-group-name', function(e){

                var li = $(this).parents('li');
                var nodeid = li.attr('nodeid');
                var mid = li.attr('mid');

                var name_span = $(this);
                var name_input = $(this).parent().find('.rename-input');

                name_span.hide();
                name_input.css('width', (name_span.width() + 32) + 'px');
                name_input.addClass('show-input');
                name_input.focus();

                name_input.on('keydown', function(ev) {

                    if(ev.keyCode == 13) {
                        var new_name = $(this).val();
                        if(self.onnamechange) {
                            self.onnamechange({name : new_name, mid : mid }, function(){
                                self.updateTreeSilbingName(new_name, mid, nodeid);
                                self.updateTree(function(){
                                    self.expandNode(self.getParentNodeId(nodeid));
                                });
                            });
                        }

                    }
                });

            });


        },
        invokeIconClick : function() {
            var self = this;
            this.wrap.on('click', '.order-icon', function(e){

                var type = $(this).attr('type');
                var li = $(this).parents('li');
                var level = li.attr('level');
                var nodeid = li.attr('nodeid');
                var nextnodeId = self.getNextNode(nodeid);
                var previousnodeId = self.getPreviousNode(nodeid);

                if(type == 'down' && nextnodeId) {
                    if(self.onexchangenode) {
                        self.onexchangenode(self.getTreeNode(nodeid).mid, self.getTreeNode(nextnodeId).mid, function(){
                            self.exchangeNodes(nodeid, nextnodeId);
                            self.updateTree(function(){
                                if(self.hasParentNode(nodeid)) {
                                    self.expandNode(self.getParentNodeId(nodeid));
                                }
                            });
                        });
                    }
                }

                if(type == 'up' && previousnodeId) {
                    if(self.onexchangenode) {
                        self.onexchangenode(self.getTreeNode(nodeid).mid, self.getTreeNode(previousnodeId).mid, function(){
                            self.exchangeNodes(nodeid, previousnodeId);
                            self.updateTree(function(){
                                if(self.hasParentNode(nodeid)) {
                                    self.expandNode(self.getParentNodeId(nodeid));
                                }
                            });
                        });
                    }
                }
            });
        },
        invokeDragNode : function() {

            var self = this;
            var li_width = self.wrap.find('li').width();
            var li_height = self.wrap.find('li').height();
            var startX = 0;
            var startY = 0;
            var li, nodeid, mid;
            var parentsNode;
            var seletedParent;

            this.wrap.smartDragIn({
                dragSelector : 'li .drag-icon',
                dragStart : function(e, selector) {
                    li = selector.parents('li');
                    nodeid = li.attr('nodeid');
                    mid = li.attr('mid');
                    parentsNode = self.wrap.find('li');
                    li.addClass('bg-info');
                    li.css('zIndex', '1');
                    li.css('opacity', '0.7');
                    startX = e.screenX;
                    startY = e.screenY;

                },
                dragMoving : function(e, selector) {
                    li.css({
                        'left' : (e.screenX - startX) + 'px',
                        'top' : (e.screenY - startY) + 'px'
                    });
                    parentsNode.each(function(index, elem){
                        var x = $(elem).offset().left;
                        var y = $(elem).offset().top;
                        if(x < e.pageX && ((x + li_width) > e.pageX) && y < e.pageY && ((y + li_height) > e.pageY)) {
                            $(elem).addClass('bg-success');
                        }else{
                            $(elem).removeClass('bg-success');
                        }

                    });

                },
                dragEnd : function(e, selector) {
                    li.removeClass('bg-info');
                    if(self.wrap.find('li.bg-success').length > 0) {
                        seletedParent = self.wrap.find('li.bg-success');
                        var p_nodeid = seletedParent.attr('nodeid');
                        var p_mid = seletedParent.attr('mid');

                        if(self.onmovenode) {
                            self.onmovenode(mid, p_mid, function(){
                                self.addTreeSibling(self.getTreeNode(nodeid), p_nodeid);
                                self.removeTreeSibling(nodeid);
                                self.updateTree(function(){
                                    self.expandNode(p_nodeid);
                                })
                            });
                        }


                    }else{
                        li.css({
                            'left' : '0px',
                            'top' : '0px',
                            'opacity' : '1'
                        });
                    }
                }

            });

        },
        invokeBtnClick : function() {
            var self = this;
            this.wrap.on('click', '.btn', function(e){

                var action = $(this).attr('action');
                var li = $(this).parents('li');
                var nodeid = li.attr('nodeid');
                var level = li.attr('level');
                var mid = li.attr('mid');

                if(action == 'add') {
                    var newnode = {};
                    self.addTreeSibling(newnode, nodeid);
                    self.updateTree(function(){
                        self.expandNode(nodeid);
                    });
                    if(self.onadd) {
                        self.onadd(self.wrap);
                    }
                }

                if(action == 'addparent') {
                    var newnode = {};
                    self.addTreeSibling(newnode);
                    self.updateTree();
                }


                if(action == 'delete') {
                    var node = self.getTreeNode(nodeid);
                    if(confirm('确定要删除' + node.name + '吗？')) {
                        if(self.ondelete) {
                            self.ondelete(node.mid, function(){
                                var parent_nodeid = self.removeTreeSibling(nodeid);
                                self.updateTree(function(){
                                    if(parent_nodeid) {
                                        self.expandNode(parent_nodeid);
                                    }
                                });
                            })
                        }

                    }
                }


                if(action == 'copy') {

                    if(self.oncopy) {
                        self.oncopy(mid, function(node){
                            var new_nodeid = self.copyTreeSibling(node, nodeid);
                            self.updateTree(function(){
                                if(new_nodeid != '') {
                                    self.expandNode(new_nodeid);
                                }
                            });
                        });
                    }

                }


                if(action == 'edit') {
                    if(self.onEdit) {
                        self.wrap.hide();
                        self.onEdit(self.getTreeNode(nodeid) );
                    }
                }


                if(action == 'save') {
                    var obj = {};
                    obj.nodename = li.find('[name=name]').val();
                    obj.appid = li.find('[name=appid]').val();
                    var parentNode = self.getParentNode(nodeid);
                    if(self.onsave) {
                        self.onsave(obj, parentNode, function(mid){
                            self.updateTreeSilbingName(obj.nodename, mid,  nodeid);
                            self.updateTree(function(){
                                self.expandNode(nodeid);
                            });
                        })
                    }
                }

                if(action == 'cancel') {
                    var parent_nodeid = self.removeTreeSibling(nodeid);
                    self.updateTree(function(){
                        if(parent_nodeid) {
                            self.expandNode(parent_nodeid);
                        }
                    });
                }
            })
        },
        invokeExpand : function() {
            var self = this;
            $(this.wrap).on('click', '.glyphicon', function() {

                var li = $(this).parent();
                var level = parseInt(li.attr('level'));
                var nodeid = li.attr('nodeid');

                if($(this).hasClass('glyphicon-plus')) {

                    console.log(1111)

                    var current_node = self.getTreeNode(nodeid);
                    var data = {
                        tree : current_node.nodes,
                        app_list : self.data.app_list,
                        level : level + 1,
                        parentNodeid : nodeid
                    }
                    if(self.highestlevel < level + 1) {
                        self.highestlevel = level + 1;
                    }
                    var nodes_html = template('tpl-tree', data);
                    $(nodes_html).insertAfter($(li));

                    $(this).removeClass('glyphicon-plus').addClass('glyphicon-minus');
                    return;

                }

                if($(this).hasClass('glyphicon-minus')) {
                    for(var i = level; i<=self.highestlevel; i++) {
                        $('[level=' + (i+1) + '][nodeid|=' + (nodeid) + ']').remove();
                    }
                    $(this).removeClass('glyphicon-minus').addClass('glyphicon-plus');
                    return;
                }
            })
        },
        expandNode : function(nodeid) {
            var index_arr = nodeid.split('-');
            var str = '';
            for(var i = 0; i<index_arr.length; i++) {
                str = (i == 0) ? index_arr[i] : (str + '-' + index_arr[i]);
                $('.glyphicon-plus[nodeid='+str+']').click();
            }
        }

    }

    $.tree = Tree;

})(window.jQuery);

// 可编辑列表
(function($){

    function EditableList(o) {

        this.data = o.data;
        this.types = o.types;
        this.categories = o.categories;
        this.configtypes = o.configtypes;
        this.searchInput = o.searchInput;
        this.wrap = o.wrap || $('body');

        this.onsave = o.onsave;
        this.ondelete = o.ondelete;
        this.onaddconfig = o.onaddconfig;
        this.onadd = o.onadd;
        this.onedit = o.onedit;

        this.init();
    }

    EditableList.prototype = {
        init : function() {
            this.clearEvent();
            this.updateList();
            this.invokeBtnClick();
            this.invokeSearch();
        },
        clearEvent : function() {
            this.wrap.off('click');
        },
        updateList : function(obj) {
            var obj = obj || {
                types : this.types,
                categories : this.categories,
                list : this.data,
                keyword : this.keyword
            };
            $(this.wrap).invokeTemp(obj);
        },
        modifyOneList : function(index, list) {
            this.data[index] = list;
        },
        deleteOneList : function(index) {
            this.data.splice(index, 1);
        },
        addReadonly : function(wrap) {
            $(wrap).find('select.editable').attr('disabled', 'true');
            $(wrap).find('input.editable').attr('readonly', 'true');
        },
        removeReadonly : function(wrap) {
            $(wrap).find('select.editable').removeAttr('disabled');
            $(wrap).find('input.editable').removeAttr('readonly');
        },
        invokeSearch : function() {
            var self = this;
            if(this.searchInput) {
                this.searchInput.on('keyup', function(e) {
                    var keyword = $(this).val();
                    self.keyword = keyword;
                    self.updateList({types : self.types, categories: self.categories, list : self.data, keyword : keyword})
                })
            }
        },
        invokeBtnClick : function() {

            var self = this;
            $(self.wrap).on('click', '.btn', function(e){
                var action = $(this).attr('action');
                var parent = $(this).parents('li');
                var index = parent.attr('index');
                var list = $.extend({}, self.data[index]);

                // 编辑
                if(action == 'edit') {
                    self.removeReadonly(parent);
                    parent.find("[name=key]").attr('readonly', 'true');
                    parent.find('.btn.status-unedit').hide();
                    parent.find('.btn.status-edit').show();
                    if(self.onedit) {
                        self.onedit(parent);
                    }
                }
                // 取消编辑
                if(action == 'cancel') {
                    self.addReadonly(parent);
                    self.updateList();
                }
                // 保存
                if(action == 'save') {
                    parent.find('.form-control').each(function(i, e){
                        var key = $(e).attr('name');
                        var value = $(e).val();
                        if(key) {
                            list[key] = value;
                        }
                    });

                    if(self.onsave) {
                        self.onsave(index, list, function(){
                            self.modifyOneList(index, list);
                            self.addReadonly(parent);
                            self.updateList();
                        });
                    }

                }

                // 添加
                if(action == 'add') {
                    var new_list = {};
                    var clone_data = $.extend([], self.data);
                    clone_data.push(new_list);
                    self.updateList({types : self.types, categories : self.categories, list : clone_data});
                    $(self.wrap).find('.btn[action=edit]').last().click();
                    $(self.wrap).find("[name=key]").last().removeAttr('readonly');
                    if(self.onadd) {
                        self.onadd(self.wrap)
                    }

                }

                // 删除
                if(action == 'delete') {
                    if(self.ondelete) {
                        if(confirm('确定要删除' + self.data[index].name + '吗？')) {
                            self.ondelete(index, list, function(){
                                self.deleteOneList(index);
                                self.updateList();
                            });
                        }

                    }

                }

                // 配置
                if(action == 'addconfig') {

                    if(self.onaddconfig) {
                        self.onaddconfig(index, list, function(configdata){
                            var configobj = $.extend({}, configdata);

                            var obj = {list : configdata, configtypes : self.configtypes};
                            var pop = new $.popup({
                                data : obj,
                                tempName : 'addconfig',
                                onshow : function(wrap) {

                                    wrap.find('.list-group').dragsort({dragSelector: ".list-group-item", dragEnd: function() { }, dragBetween: false, placeHolderTemplate: "<li class='list-group-item'></li>" });


                                    wrap.on('click', '.btn', function(e) {

                                        var btnaction = $(this).attr('action');
                                        var btnparent =  $(this).parents('li');
                                        var btnindex = btnparent.attr('index');


                                        // 获取数据
                                        configobj.mode = wrap.find('[name=mode]:checked').val();
                                        if(configobj.mode == '1') {
                                            configobj.data = [];
                                            wrap.find('.part-1 .form-inline').each(function(i, v){
                                                var name = $(v).find('[name=name]').val();
                                                var key = $(v).find('[name=key]').val();
                                                configobj.data.push({name : name, key: key});
                                            })
                                        }
                                        if(configobj.mode == '2') {
                                            configobj.url = $('.part-2 [name=url]').val();
                                        }

                                        if(btnaction == 'delete') {
                                            configobj.data.splice(btnindex, 1);
                                            pop.updateInner({list : configobj, configtypes : self.configtypes});
                                        }

                                        if(btnaction == 'add') {

                                            if(!obj.list.data) {
                                                obj.list.data = [];
                                            }
                                            configobj.data.push({});
                                            pop.updateInner({list : configobj, configtypes : self.configtypes});
                                        }

                                    });

                                },
                                onsubmit : function(wrap) {

                                    configobj.mode = wrap.find('[name=mode]:checked').val();
                                    if(configobj.mode == '1') {
                                        configobj.data = [];
                                        wrap.find('.part-1 .form-inline').each(function(i, v){
                                            var name = $(v).find('[name=name]').val();
                                            var key = $(v).find('[name=key]').val();
                                            configobj.data.push({name : name, key: key});
                                        })
                                    }

                                    if(configobj.mode == '2') {
                                        configobj.url = $('.part-2 [name=url]').val();
                                    }

                                    if(self.onsave) {
                                        self.onsave(index, configobj, function(){
                                            pop.close();
                                        })
                                    }
                                }
                            });

                        })
                    }


                }

            });

        }
    };

    $.editableList = EditableList;

})(window.jQuery);

// Panel list
(function($){

    function Panellist(o) {
        this.data = o.data;
        this.mid = o.mid;
        this.types = o.types;
        this.filters = o.filters;
        this.headers = o.headers;
        this.charts = o.charts;
        this.categories = o.categories;
        this.wrap = o.wrap;
        this.onsubmit = o.onsubmit;
        this.ondelete = o.ondelete;
        this.onedit = o.onedit;
        this.onsave = o.onsave;
        this.oninit = o.oninit;
        this.init();
    }

    Panellist.prototype = {
        init : function() {
            this.clearEvent();
            this.wrap.show();
            this.updateList();
            this.invokeBtnClick();
            if(this.oninit) {
                this.oninit(this.wrap);
            }
        },
        clearEvent : function() {
            this.wrap.off('click');
            this.wrap.off('change');
        },
        updataPtype : function(val) {
            this.data.ptype = val;
        },
        updatePanelConfig : function(type, data) {
            if(type == 'table') {
                this.data.config[type] = data;
            }else{
                this.data.config[type] = data[type];
            }
            this.updateList();
        },
        updateList : function() {
            var obj = {config : this.data.config, types : this.types, filters : this.filters, headers : this.headers, charts : this.charts, categories : this.categories};
            this.wrap.invokeTemp(obj);
        },
        expandPanel : function(panel) {
            panel.find('[action=expand]').hide();
            panel.find('[action=shrink]').show();
            panel.find('.panel-body').show();
        },
        shrinkPanel : function(panel) {
            panel.find('[action=expand]').show();
            panel.find('[action=shrink]').hide();
            panel.find('.panel-body').hide();
        },
        deletePanel : function(panelkey) {

            this.updateList();
        },
        updatePanel : function(index, panel) {
            if(this.data.modules  && $.isArray(this.data.modules) ) {
                this.data.modules[index] = panel;
            }else{
                this.data.modules = [panel];
            }
        },
        showEditPop : function(panelkey) {

        },
        invokeBtnClick : function() {
            var self = this;
            this.wrap.on('click', '.btn', function(){
                var action = $(this).attr('action');
                var panel = $(this).parents('.panel');
                var panelkey = panel.attr('panel-key');

                if(action == 'expand') {
                    self.expandPanel(panel);
                }

                if(action == 'shrink') {
                    self.shrinkPanel(panel);
                }

                if(action == 'save') {
                    if(self.onsave) {
                        self.onsave(self.wrap);
                    }
                }

                if(action == 'add') {
                    if(self.onedit) {
                        self.onedit('desc');
                    }
                }

                if(action == 'edit') {
                    if(self.onedit) {
                        self.onedit(panelkey);
                    }

                    self.showEditPop(panelkey);
                }

                if(action == 'delete') {

                    if(self.ondelete) {
                        self.ondelete(panelkey, function(){
                            self.deletePanel(panelkey);
                        });
                    }

                }

            })
        }
    }

    $.panellist = Panellist;

})(window.jQuery);

// muti graph
(function($){

    function Mutigraph(o) {
        this.data = o.data;
        this.mid = o.mid;
        this.appid = o.appid;
        this.wrap = o.wrap;
        this.onFilterSubmit = o.onFilterSubmit;
        this.onTableClick = o.onTableClick;
        this.onChangePage = o.onChangePage;
        this.gh = null;
        this.init();
    }

    Mutigraph.prototype = {

        init : function() {
            this.clearEvent();
            this.updateGraph();
            this.fadeOutDesc();
        },
        clearEvent : function() {
          this.wrap.off('click');
        },
        updateGraph : function() {

            var self = this;
            this.wrap.invokeTemp(this.data, 'graph');
            self.createFilter();
            self.createOnePart();

        },
        fadeOutDesc : function() {
            var self = this;
            setTimeout(function(){
                self.wrap.find('#stat-desc').fadeOut('slow');
            }, 1500);

            var flag = 0;
            self.wrap.find('.page-header .glyphicon-info-sign').click(function(){
                if(flag == 0){
                    self.wrap.find('#stat-desc').fadeIn();
                    flag = 1;
                }else{
                    self.wrap.find('#stat-desc').fadeOut();
                    flag = 0;
                }
            });
        },
        createFilter : function() {
            var data = this.data || d;
            var self = this;
            if(data.filterConfig) {
                new $.filtergraph({
                    data : {data : data.filterConfig, info: data.info, filterSelected : data.filterSelected,  appid : self.appid, mid : self.mid },
                    wrap : self.wrap.find('.filter'),
                    onsubmit : self.onFilterSubmit
                });
            }
        },
        createOnePart : function(d) {

            var self = this;
            var data = this.data;
            var info = data.info;

            if(d) {
                data.data = d;
            }

            if(data.data) {

                var chart_data = data.data;
                if(chart_data.table) {

                    new $.tablegraph({
                        data : chart_data.table,
                        line : chart_data.line,
                        pie : chart_data.pie,
                        linetype : info.charttype,
                        wrap : self.wrap.find('.table-graph'),
                        onTableClick : self.onTableClick
                    });
                }

                if(chart_data.line) {

                    new $.linegraph({
                        data : chart_data.line,
                        wrap : self.wrap.find('.line-graph'),
                        type : info.charttype
                    });

                }

                if(chart_data.pie) {

                    new $.piegraph({
                        data : chart_data.pie,
                        wrap : self.wrap.find('.line-graph')
                    })
                }

                // paging
                if(data.info.page > 0) {
                    new $.paging({
                        data : data.data,
                        wrap : self.wrap.find('.paging'),
                        onClick : self.onChangePage
                    });
                }

            }

        }

    }

    $.mutigraph = Mutigraph;


})(window.jQuery);

// graph 筛选
(function($){

    function Filtergraph(o) {
        this.data = o.data;
        this.wrap = o.wrap;
        this.onsubmit = o.onsubmit;
        this.graph = o.graph;
        this.init();
    }

    Filtergraph.prototype = {
        init : function() {
            this.updateFilter();
            this.invokeClickBtn();
        },
        formatSelect : function() {
            this.wrap.find('select').comboSelect();
            this.wrap.find('select').hide();
        },
        updateFilter : function() {
            this.wrap.invokeTemp(this.data);
            var self = this;
            setTimeout(function(){
                self.formatSelect();
                self.invokeDatepicker();
            },200)
        },
        invokeClickBtn : function() {
            var self = this;
            this.wrap.on('click','.btn', function(e){

                var action = $(this).attr('action');
                var type = $(this).attr('type');
                if(action == 'search') {
                    if(self.onsubmit) {
                        self.onsubmit(self.wrap, type);
                    }
                }

                if(action == 'clear') {
                    self.updateFilter();
                }

            });
        },
        invokeDatepicker : function() {
            this.wrap.find('.datepicker-input.day-type').datepicker({
                format: "yyyymmdd",
                autoclose: true,
                orientation: "bottom left",
                language: "zh-CN"
            });

            this.wrap.find('.datepicker-input.month-type').datepicker({
                format: "yyyymm",
                autoclose: true,
                orientation: "bottom left",
                minViewMode: 1,
                maxViewMode: 2,
                language: "zh-CN"

            });
        }
    }

    $.filtergraph = Filtergraph;

})(window.jQuery);

// graph 线图
(function($){

    function Linegraph(o) {
        this.data = o.data;
        this.wrap = o.wrap;
        this.type = o.type;
        this.init();
    }

    Linegraph.prototype = {


        init : function() {

            if(this.type == 1) {
                // 线图
                this.wrap.highcharts({
                    title: {
                        text: ''
                    },
                    xAxis : {
                        categories : this.data.categories,
                        labels : {
                            rotation: 45
                        }
                    },
                    series : this.data.series
                });
            }

            if(this.type == 2) {
                // 面积图
                this.wrap.highcharts({
                    title: {
                        text: ''
                    },
                    chart: {
                        type: 'area'
                    },
                    xAxis : {
                        categories : this.data.categories,
                        labels : {
                            rotation: 45
                        }

                    },
                    series : this.data.series
                });
            }

            if(this.type == 3) {
                // 条形图
                this.wrap.highcharts({
                    title: {
                        text: ''
                    },
                    chart: {
                        type: 'column'
                    },
                    xAxis : {
                        categories : this.data.categories,
                        labels : {
                            rotation: 45
                        }
                    },
                    series : this.data.series
                });

            }

        }

    }

    $.linegraph = Linegraph;

})(window.jQuery);

// graph 饼图
(function($){

    function Piegraph(o) {
        this.data = o.data;
        this.wrap = o.wrap;
        this.init();
    }

    Piegraph.prototype = {
        init : function() {

            var series = {name : this.data.name, data : [], colorByPoint: true,};
            $.each(this.data.data,function(i, v){
                series.data.push({name : v[0], y: v[1]});
            });


            this.wrap.highcharts({
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                title: {
                    text: ''
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                            }
                        }
                    }
                },
                series: [series]
            })

        }
    }

    $.piegraph = Piegraph;

})(window.jQuery);

// graph table
(function($){

    function Tablegraph(o) {

        this.data = o.data;
        this.line = o.line;
        this.pie = o.pie;
        this.wrap = o.wrap;
        this.linetype = o.linetype;
        this.onTableClick = o.onTableClick;
        this.init();

    }

    Tablegraph.prototype = {

        init : function() {
            this.clearEvent();
            this.updateTablegraph();
            this.invokeClickBtn();
        },
        clearEvent : function() {
            this.wrap.off('click');
        },
        updateTablegraph : function(sortindex, sorttype) {
            var obj = $.extend({}, this.data);
            obj.sortindex = sortindex;
            obj.sorttype = sorttype;
            this.wrap.invokeTemp(obj);

            var self = this;
            setTimeout(function(){
                if(self.wrap.find('.table-wrapper').width() < self.wrap.find('.table-wrapper>table').width()) {
//                    self.wrap.find('.table-wrapper table tr>td:eq(0)>.table-td').css('maxWidth','180px');
                }else{
                    var width = self.wrap.find('.table-wrapper table tr>td:eq(0)').width();
                    self.wrap.find('.table-wrapper table tr').find('td:eq(0)>.table-td').css('maxWidth', width + 'px');

                }

                if(self.wrap.parents('.modal-body').length == 0) {
                    self.wrap.find('table').smartTable();
                }else{

//                self.wrap.find('table').smartTable('popup');
                }

            }, 200)

        },
        invokeClickBtn : function() {
            var self = this;
            if(this.onTableClick) {
                this.onTableClick(this.wrap);
            }

            var sorttype = 'down';
            this.wrap.on('click', 'thead td', function(e){
                var index = $(this).index();
                self.sortTable(index, sorttype);
                sorttype = (sorttype == 'down' ? 'up' :'down');


                if(self.line) {
                    self.sortLine(index, sorttype);
                }
            });

        },
        sortLine : function(index, type) {

            var self = this;
            for(var i = 0; i<this.data.tableData.length; i++) {
                for(var j = 0; j<this.data.tableData[i].length; j++) {
                    if(j == 0) {
                        self.line.categories[i] = this.data.tableData[i][j];
                    }else {
                        self.line.series[j-1].data[i] = parseFloat(this.data.tableData[i][j]);
                    }
                }
            }

            new $.linegraph({
                data : self.line,
                wrap : self.wrap.parent().find('.line-graph'),
                type : self.linetype
            });

        },

        sortTable : function(index, type) {

            this.data.tableData.sort(this.sortBy(index, type));
            this.updateTablegraph(index, type);

        },
        sortBy : function(index, type) {
            return function(o, p){
                var a, b;
                var c, d;
                if (o && p) {
                    a = parseFloat(o[index]);
                    b = parseFloat(p[index]);
                    if(!isNaN(a) && !isNaN(b)) {
                        if (a === b) {
                            return 0;
                        }

                        if(type == 'down') {
                            return a < b ? -1 : 1;
                        }else{
                            return a > b ? -1 : 1;
                        }
                    }else{
                        c = o[index] + ' ';
                        d = p[index] + ' ';

                        if(c === d) {
                            return 0;
                        }

                        if(type == 'down') {
                            return c[0].toLowerCase() < d[0].toLowerCase() ? -1 : 1;
                        }else{
                            return c[0].toLowerCase() > d[0].toLowerCase() ? -1 : 1;
                        }

                    }

                }else {
                    throw ("error");
                }
            }
        },
        sortByLine : function(index, type) {

            return function(o, p) {
                if(index == 0) {
                    var a,b;
                    a = parseFloat(o);
                    b = parseFloat(p);

                    if (a === b) {
                        return 0;
                    }

                    if(type == 'down') {
                        return a < b ? -1 : 1;
                    }else{
                        return a > b ? -1 : 1;
                    }

                }else{

                }
            }



        }

    }

    $.tablegraph = Tablegraph;

})(window.jQuery);

// paging 分页
(function($){

    function Paging(o) {
        this.data = o.data;
        this.wrap = o.wrap;
        this.onClick = o.onClick;
        this.init();

    }

    Paging.prototype = {
        init : function() {
            this.clearEvent();
            this.updatePaging();
            this.invokeClickBtn();
        },
        updatePaging : function() {
            var obj = this.data;
            this.wrap.invokeTemp(obj);
        },
        clearEvent : function() {
            this.wrap.off('click');
        },
        invokeClickBtn : function() {
            var self = this;
            this.wrap.on('click', 'li', function(e){
                var action = $(this).attr('action');
                var index = $(this).attr('index');
                if(action == 'page') {
                    if(self.onClick) {
                        self.onClick(index);
                    }
                }

            })
        }
    }

    $.paging = Paging;


})(window.jQuery);

