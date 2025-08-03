from django.db import models

# Create your models here.
class CulturalEvent(models.Model):
    title = models.CharField(max_length=700)  # 공연/행사명
    codename = models.CharField(max_length=700)  # 분류 (CODENAME)
    category = models.CharField(max_length=700)  # 사용자 지정 카테고리 (음악/콘서트 등)
    guname = models.CharField(max_length=700)  # 자치구 (GUNAME)
    date = models.CharField(max_length=700)  # 날짜/시간 (DATE)
    place = models.CharField(max_length=700, blank=True)  # 장소
    org_name = models.CharField(max_length=700, blank=True)  # 기관명
    use_trgt = models.CharField(max_length=700, blank=True)  # 이용대상
    use_fee = models.CharField(max_length=700, blank=True)  # 이용요금
    player = models.TextField(blank=True)  # 출연자정보
    program = models.TextField(blank=True)  # 프로그램소개
    etc_desc = models.TextField(blank=True)  # 기타내용
    org_link = models.URLField(max_length=700)  # 기관 홈페이지 주소
    main_img = models.URLField(max_length=700)  # 대표 이미지
    rgst_date = models.DateField(null=True, blank=True)  # 신청일자
    ticket = models.CharField(max_length=700, blank=True)  # 시민/기관
    start_date = models.DateField(null=True, blank=True)  # 시작일
    end_date = models.DateField(null=True, blank=True)  # 종료일
    themecode = models.CharField(max_length=700, blank=True)  # 테마분류
    lot = models.CharField(max_length=700, blank=True)  # 위도
    lat = models.CharField(max_length=700, blank=True)  # 경도
    is_free = models.CharField(max_length=700, blank=True)  # 유무료
    hmpg_addr = models.URLField(max_length=700)  # 문화포털 상세 URL

    def __str__(self):
        return f"[{self.guname}] {self.title}"