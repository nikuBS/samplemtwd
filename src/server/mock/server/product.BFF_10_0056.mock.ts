const BFF_10_0056_mock = {
  "code": "00",
  "msg": "success",
  "result": {
    "roamingProdList": [
      {
        "prodId": "NA00004088",
        "prodNm": "T로밍 OnePass300기간형",
        "scrbDt": "20180826",
        "basFeeTxt": "9900",
        "prodLinkYn": "N",
        "btnList": [
          {
            "btnTypCd": "SE",
            "btnNm": "기간 확인",
            "btnLinkUrl": "/product/roaming/lookup/"
          }
        ]
      },
      {
        "prodId": "NA00005900",
        "prodNm": "T로밍 아시아패스",
        "scrbDt": "20180826",
        "basFeeTxt": "25000",
        "prodLinkYn": "Y",
        "btnList": [
          {
            "btnTypCd": "SC",
            "btnNm": "가입",
            "btnLinkUrl": "/product/roaming/join/confirm-info/"
          },
          {
            "btnTypCd": "SE",
            "btnNm": "가입 내역 조회",
            "btnLinkUrl": "/product/roaming/setting/roaming-auto/"
          },
          {
            "btnTypCd": "TE",
            "btnNm": "해지",
            "btnLinkUrl": "/product/roaming/terminate"
          },
          {
            "btnTypCd": "SE",
            "btnNm": "설정 변경",
            "btnLinkUrl": "/product/roaming/setting/roaming-auto/"
          }
        ]
      },
      {
        "prodId": "NA00004684",
        "prodNm": "00700 프리 10",
        "scrbDt": "20150915",
        "basFeeTxt": "11000",
        "prodLinkYn": "Y",
        "btnList": [
          {
            "btnTypCd": "TE",
            "btnNm": "해지",
            "btnLinkUrl": "/product/mobileplan-add/terminate"
          }
        ]
      }
    ]
  }
};

export default BFF_10_0056_mock;
