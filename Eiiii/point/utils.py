from .models import PointHistory

def adjust_point(user, amount, reason):
    user.point += amount
    user.save()

    PointHistory.objects.create(
        user=user,
        amount=amount,
        reason=reason
    )