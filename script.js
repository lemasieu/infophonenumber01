document.addEventListener("DOMContentLoaded", () => {
    const inputPhoneNumber = document.getElementById("phone-number");
    const typeInput = document.getElementById("type");
    const detailInput = document.getElementById("details");
    const checkButton = document.getElementById("check");

    // Kiểm tra xem các phần tử DOM có tồn tại hay không
    if (!inputPhoneNumber || !typeInput || !detailInput || !checkButton) {
        console.error("Một hoặc nhiều phần tử DOM không được tìm thấy.");
        return;
    }

    let data = {};

    // Tải dữ liệu từ file data.json
    fetch("data.json")
        .then(response => {
            if (!response.ok) throw new Error("Không thể tải data.json");
            return response.json();
        })
        .then(jsonData => {
            data = jsonData; // Lưu trữ dữ liệu vào biến 'data'
        })
        .catch(error => {
            console.error("Lỗi tải dữ liệu:", error);
        });

    // Xử lý khi bấm nút "Kiểm tra"
    checkButton.addEventListener("click", () => {
        let phoneNumber = inputPhoneNumber.value.trim();
        typeInput.value = "";
        detailInput.value = "";

        // Loại bỏ tất cả ký tự không phải số và dấu "+"
        phoneNumber = phoneNumber.replace(/[^0-9+]/g, "");

        // Nếu là số điện thoại Việt Nam, thay thế +84 bằng 0
        if (phoneNumber.startsWith("+84")) {
            phoneNumber = "0" + phoneNumber.slice(3);
        } else if (phoneNumber.startsWith("+") && !phoneNumber.startsWith("+84")) {
            // Nếu là số điện thoại nước ngoài
            typeInput.value = "Số nước ngoài";
            detailInput.value = "Không áp dụng";
            return;
        }

        // Kiểm tra độ dài số điện thoại
        if (phoneNumber.length === 10) {
            // Số điện thoại di động
            typeInput.value = "Số điện thoại di động";
            const prefix = phoneNumber.slice(0, 3);
            const carrier = findCarrier(prefix, data.mobile);
            detailInput.value = carrier || "Không rõ nhà mạng";
        } else if (phoneNumber.length === 11) {
            // Số điện thoại cố định
            const prefix = phoneNumber.slice(0, 4);
            if (prefix.startsWith("024")) {
                typeInput.value = "Số điện thoại cố định";
                detailInput.value = "Hà Nội";
            } else if (prefix.startsWith("028")) {
                typeInput.value = "Số điện thoại cố định";
                detailInput.value = "TP.HCM";
            } else {
                typeInput.value = "Số điện thoại cố định";
                const province = findProvince(prefix, data.landline);
                detailInput.value = province || "Không rõ tỉnh quản lý";
            }
        } else {
            // Số hotline
            typeInput.value = "Số điện thoại tổng đài";
            detailInput.value = "Vui lòng kiểm tra trên Truecaller/ Trang Trắng";
        }
    });

    // Hàm tìm nhà mạng dựa trên prefix cho số điện thoại di động
    function findCarrier(prefix, mobileData) {
        for (const carrier of mobileData) {
            if (carrier.prefixes.includes(prefix)) {
                return carrier.carrier;
            }
        }
        return null;
    }

    // Hàm tìm tỉnh quản lý dựa trên prefix cho số điện thoại cố định
    function findProvince(prefix, landlineData) {
        for (const province of landlineData) {
            if (province.prefixes.includes(prefix)) {
                return province.province;
            }
        }
        return null;
    }
});
