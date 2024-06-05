//Hàm validator - constructor function
function Validator(options) {
    var selectorRules = {};
    //Hàm thực hiện validate
    function validate(inputElement, rule, errorElement) {
        var errorMessage = rule.test(inputElement.value);
        console.log(errorMessage);
        //Lấy ra rule của selector
        var rules = selectorRules[rule.selector];
        //Lặp qua từng rule và kiểm tra
        //Nếu có lỗi thì dừng việc kiểm tra
        for(let i = 0; i < rules.length; i++) {
            errorMessage = rules[i](inputElement.value);
            if(errorMessage) break;
        }
        if(errorMessage) {
            errorElement.innerText = errorMessage;
            inputElement.parentElement.classList.add('invalid');
        }
        else{
            errorElement.innerText = '';
            inputElement.parentElement.classList.remove('invalid');
        }
        //convert sang boolean
        return !errorMessage;
    }
    
    //Lấy element của form cần validate
    var formElement = document.querySelector(options.form);
    console.log(formElement);
    console.log(options.rules);
    //Nếu tồn tại form đó
    if(formElement) {
        //khi submit form thì sẽ ngăn chặn việc submit
        formElement.onsubmit = function(e) {
            e.preventDefault();
            var isFormValid = true;
            //Lặp qua từng rule và xử lý (lắng nghe sự kiện blur, input, ...)
            //check validate khi submit
            options.rules.forEach(function(rule) {
                var inputElement = formElement.querySelector(rule.selector);
                 //parentElement là thẻ cha của inputElement
                var errorElement = inputElement.parentElement.querySelector('.form-message');
                var isValid = validate(inputElement, rule, errorElement);
                if(!isValid) {
                    isFormValid = false;
                }
            });
            if(isFormValid) {
                console.log('Không có lỗi');
                //Trường hợp submit với javascript
                if(typeof options.onSubmit === 'function') {
                    //lấy ra các data của input mà không phải là disabled
                    var enableInputs = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                        return (values[input.name] = input.value) && values;
                    },{});
                    options.onSubmit(formValues);
                }
                //Trường hợp submit với hành vi mặc định
                else{
                    formElement.submit();
                }
            }
            else{
                console.log('Có lỗi');
            }
        }
        //Lặp qua từng rule và xử lý (lắng nghe sự kiện blur, input, ...)
        options.rules.forEach(function(rule) {
            //Lưu lại các rules cho mỗi input
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            }
            else{
                selectorRules[rule.selector] = [rule.test];
            }
            //lấy ra element của input cần validate
            var inputElement = formElement.querySelector(rule.selector);
            //parentElement là thẻ cha của inputElement
            var errorElement = inputElement.parentElement.querySelector('.form-message');
            if(inputElement) {
                //Xử lý trường hợp blur khỏi input
                inputElement.onblur = function() {
                   validate(inputElement, rule, errorElement);
                }
                //Xử lý trường hợp mỗi khi người dùng nhập vào input
                inputElement.oninput = function() {
                    errorElement.innerText = '';
                    inputElement.parentElement.classList.remove('invalid');
                }   
            }
        });
    }
};

//Định nghĩa rules
//Nguyên tắc của các rules
//1. Khi có lỗi thì trả ra message lỗi
//2. Khi hợp lệ thì không trả ra gì cả (undefined)
Validator.isRequired = function (selector) {
    return {
        selector: selector,
        test: function(value) {
            return value.trim() ? undefined : 'Vui lòng nhập trường này';
        }
    };
};

Validator.isEmail = function (selector) {
    return {
        selector: selector,
        test: function(value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            //Kiểm tra xem value có phải là email không
            return emailRegex.test(value) ? undefined : 'Trường này phải là email';
        }
    };
};

Validator.minLength = function(selector, min) {
    return {
        selector: selector,
        test: function(value) {
            return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} ký tự`;
        }
    };
};

Validator.isConfirmed = function(selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function(value) {
            //getConfirmValue là hàm lấy ra giá trị của input xác nhận
            //nếu có message thì sẽ hiển thị message đó, không thì sẽ hiển thị message mặc định
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác';
        }
    };
};